

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';


const API_URL = 'http://localhost:5000/api/';


const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() : name[0].toUpperCase();
};

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;



const BookCard = ({ book, onDelete }) => {
    const statusColor = { 'Read': 'bg-green-100 text-green-800', 'Reading': 'bg-blue-100 text-blue-800', 'To Read': 'bg-yellow-100 text-yellow-800' };
    const coverUrl = book.coverImageUrl ? `http://localhost:5000${book.coverImageUrl.replace(/\\/g, '/')}` : `https://placehold.co/300x450/E2E8F0/4A5568?text=${book.title.split(' ').join('+')}`;

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
            onDelete(book._id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group relative">
            <button onClick={handleDelete} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 hover:bg-red-700" aria-label="Delete book">
                <TrashIcon />
            </button>
            <img src={coverUrl} alt={`${book.title} cover`} className="h-48 w-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/300x450/E2E8F0/4A5568?text=No+Image`; }}/>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                <div className="flex justify-between items-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[book.status]}`}>{book.status}</span>
                    <span className="text-xs text-gray-500">{book.genre}</span>
                </div>
            </div>
        </div>
    );
};

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
    const [formData, setFormData] = useState({ title: '', author: '', genre: '', status: 'To Read' });
    const [cover, setCover] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.title || !formData.author) {
            setError("Title and Author are required.");
            return;
        }

        const bookData = new FormData();
        bookData.append('title', formData.title);
        bookData.append('author', formData.author);
        bookData.append('genre', formData.genre);
        bookData.append('status', formData.status);
        if (cover) {
            bookData.append('cover', cover);
        }

        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const { data } = await axios.post(API_URL + 'books', bookData, config);
            onBookAdded(data);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add book.');
        }
    };

    const handleClose = () => {
        setFormData({ title: '', author: '', genre: '', status: 'To Read' });
        setCover(null);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold mb-4">Add a New Book</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="shadow border rounded w-full py-2 px-3 mb-4" required />
                    <input type="text" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="shadow border rounded w-full py-2 px-3 mb-4" required />
                    <input type="text" placeholder="Genre" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} className="shadow border rounded w-full py-2 px-3 mb-4" />
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="shadow border rounded w-full py-2 px-3 mb-4">
                        <option>To Read</option>
                        <option>Reading</option>
                        <option>Read</option>
                    </select>
                    <input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 hover:file:bg-indigo-100 mb-6"/>
                    <div className="flex items-center justify-end gap-4">
                        <button type="button" onClick={handleClose} className="text-gray-600">Cancel</button>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add Book</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AuthPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const url = API_URL + 'auth/' + (isLogin ? 'login' : 'register');
        try {
            const { data } = await axios.post(url, formData);
            onLogin(data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h1>
                    <p className="mt-2 text-gray-600">{isLogin ? 'Sign in to your library' : 'Start tracking your books today'}</p>
                </div>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded" required />}
                    <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border rounded" required />
                    <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 border rounded" required />
                    <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white text-lg font-semibold">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                <p className="text-center text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const ProfileDashboard = ({ user, books }) => {
    const stats = useMemo(() => {
        return {
            read: books.filter(b => b.status === 'Read').length,
            reading: books.filter(b => b.status === 'Reading').length,
            toRead: books.filter(b => b.status === 'To Read').length,
        };
    }, [books]);

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {getInitials(user.name)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Your Library at a Glance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="bg-green-100 p-4 rounded-lg">
                            <p className="text-3xl font-bold text-green-800">{stats.read}</p>
                            <p className="text-green-700 font-medium">Books Read</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg">
                            <p className="text-3xl font-bold text-blue-800">{stats.reading}</p>
                            <p className="text-blue-700 font-medium">Currently Reading</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg">
                            <p className="text-3xl font-bold text-yellow-800">{stats.toRead}</p>
                            <p className="text-yellow-700 font-medium">Want to Read</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



function App() {
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activePage, setActivePage] = useState('library'); // NEW: State to control view

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            if (user) {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get(API_URL + 'books', config);
                    setBooks(data);
                } catch (error) {
                    console.error('Could not fetch books', error);
                    if (error.response?.status === 401) handleLogout();
                }
            }
        };
        fetchBooks();
    }, [user]);

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setActivePage('library');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setBooks([]);
    };

    const handleBookAdded = (newBook) => {
        setBooks([newBook, ...books]);
    };
    
    const handleDeleteBook = async (bookId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(API_URL + `books/${bookId}`, config);
            setBooks(books.filter(book => book._id !== bookId));
        } catch (error) {
            console.error('Could not delete book', error);
            alert('Failed to delete the book. Please try again.');
        }
    };
    
    const filteredBooks = useMemo(() => {
        return books
            .filter(book => statusFilter === 'All' || book.status === statusFilter)
            .filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [books, statusFilter, searchQuery]);

    if (!user) {
        return <AuthPage onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2"><BookOpenIcon /><span className="text-xl font-bold text-gray-800">MyLibrary</span></div>
                    <div className="flex items-center space-x-4">
                        {}
                        <button onClick={() => setActivePage('library')} className={`px-3 py-2 rounded-md text-sm font-medium ${activePage === 'library' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}>Bookshelf</button>
                        <button onClick={() => setActivePage('profile')} className={`px-3 py-2 rounded-md text-sm font-medium ${activePage === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}>Profile</button>
                        <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700">Logout</button>
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">{getInitials(user.name)}</div>
                    </div>
                </nav>
            </header>

            <main className="container mx-auto p-6">
                {}
                {activePage === 'library' && (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div><h1 className="text-3xl font-bold text-gray-800">Your Bookshelf</h1><p className="text-gray-500">All your books in one place.</p></div>
                            <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"><PlusIcon />Add Book</button>
                        </div>
                        
                        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center">
                            <input type="text" placeholder="Filter by title or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:flex-1 px-4 py-2 border rounded-lg" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-auto px-4 py-2 border rounded-lg">
                                <option value="All">All Statuses</option>
                                <option value="To Read">To Read</option>
                                <option value="Reading">Reading</option>
                                <option value="Read">Read</option>
                            </select>
                        </div>

                        {filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredBooks.map(book => <BookCard key={book._id} book={book} onDelete={handleDeleteBook} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16"><h2 className="text-xl font-semibold text-gray-700">No books found.</h2><p className="text-gray-500 mt-2">Try adjusting your filters or add a new book!</p></div>
                        )}
                    </>
                )}
                
                {activePage === 'profile' && <ProfileDashboard user={user} books={books} />}

            </main>

            <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onBookAdded={handleBookAdded} />
        </div>
    );
}

export default App;
