import React, { useState, useRef, useEffect } from 'react';

interface Comment {
  id: number;
  username: string;
  content: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

interface Post {
  id: number;
  username: string;
  content: string;
  likes: number;
  dislikes: number;
  author: string;
  authorProfilePic: string;
  isEvent: boolean;
  createdAt: number;
  likedBy: string[];
  dislikedBy: string[];
  comments: Comment[];
}

interface Event extends Omit<Post, 'isEvent'> {
  media: {
    type: 'image' | 'video';
    url: string;
    overlayText?: string;
  };
}

interface UserPreferences {
  privateProfile: boolean;
  hideLikes: boolean;
  hideDislikes: boolean;
}

interface User {
  username: string;
  password: string;
}

const FacebookApp: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      username: 'maternum',
      content: 'I am the best',
      likes: 10,
      dislikes: 0,
      author: 'maternum',
      authorProfilePic: 'https://via.placeholder.com/40',
      isEvent: false,
      createdAt: Date.now() - 3600000, // 1 hour ago
      likedBy: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
      dislikedBy: [],
      comments: [
        {
          id: 1,
          username: 'cire',
          content: 'wehh',
          likes: 1,
          dislikes: 0,
          likedBy: ['user1'],
          dislikedBy: []
        }
      ]
    }
  ]);
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      username: 'mary',
      content: 'I love my 2 kids',
      likes: 5,
      dislikes: 0,
      author: 'mary',
      authorProfilePic: 'https://via.placeholder.com/40',
      createdAt: Date.now() - 7200000, // 2 hours ago
      likedBy: ['user1', 'user2', 'user3', 'user4', 'user5','david'],
      dislikedBy: [],
      comments: [
        {
          id: 1,
          username: 'david',
          content: 'I love you more hunny 😘',
          likes: 0,
          dislikes: 0,
          likedBy: ['mary','bobby'],
          dislikedBy: []
        }
      ],
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1602661287394-ccf02e1a0893?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        overlayText: 'My son and dog playing in the yard'
      }
    }
  ]);
  const [users, setUsers] = useState<User[]>([
    { username: 'mary', password: '123' },
    { username: 'maternum', password: '123' },
    { username: 'cire', password: '123' },
    { username: 'david', password: '123' }
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newEventContent, setNewEventContent] = useState('');
  const [newEventMedia, setNewEventMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [newEventOverlayText, setNewEventOverlayText] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    privateProfile: false,
    hideLikes: false,
    hideDislikes: false,
  });
  const [showEvents, setShowEvents] = useState(false);

  const [editingPost, setEditingPost] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<{ postId: number, commentId: number } | null>(null);
  const [editContent, setEditContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const handleLogin = () => {
    if (username.trim() === '' || password.trim() === '') {
      alert('Please enter both username and password');
      return;
    }
    const user = users.find(u => u.username === username);
    if (user) {
      if (user.password === password) {
        setIsLoggedIn(true);
      } else {
        alert('Incorrect password');
      }
    } else {
      alert('User not found');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setFollowing([]);
    setProfilePic(null);
    setUserPreferences({
      privateProfile: false,
      hideLikes: false,
      hideDislikes: false,
    });
    setShowSettings(false);
  };

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSetting = (setting: keyof UserPreferences) => {
    setUserPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAddPost = () => {
    if (newPostContent.trim() === '') {
      alert('Post content is required');
      return;
    }

    const newPost: Post = {
      id: posts.length + 1,
      username,
      content: newPostContent,
      likes: 0,
      dislikes: 0,
      author: username,
      authorProfilePic: profilePic || '',
      isEvent: false,
      createdAt: Date.now(),
      likedBy: [],
      dislikedBy: [],
      comments: []
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleAddEvent = () => {
    if (newEventContent.trim() === '' || !newEventMedia) {
      alert('Event content and media are required');
      return;
    }

    if (newEventMedia.type === 'video') {
      const video = document.createElement('video');
      video.src = newEventMedia.url;
      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (duration > 10) {
          trimVideo(newEventMedia.url, 10).then(trimmedVideoUrl => {
            addNewEvent(trimmedVideoUrl);
          });
        } else {
          addNewEvent(newEventMedia.url);
        }
      };
    } else {
      addNewEvent(newEventMedia.url);
    }
  };

  const addNewEvent = (mediaUrl: string) => {
    const newEvent: Event = {
      id: events.length + 1,
      username,
      content: newEventContent,
      likes: 0,
      dislikes: 0,
      author: username,
      authorProfilePic: profilePic || '',
      createdAt: Date.now(),
      likedBy: [],
      dislikedBy: [],
      comments: [],
      media: {
        type: newEventMedia!.type,
        url: mediaUrl,
        overlayText: newEventOverlayText
      }
    };
    setEvents([newEvent, ...events]);
    setNewEventContent('');
    setNewEventMedia(null);
    setNewEventOverlayText('');
  };

  const trimVideo = (videoUrl: string, maxDuration: number): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;

        video.currentTime = 0;
        video.ontimeupdate = () => {
          if (video.currentTime >= maxDuration) {
            video.pause();
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              resolve(URL.createObjectURL(blob!));
            }, 'image/jpeg');
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            video.currentTime += 1/30; // Assume 30 fps
          }
        };
        video.play();
      };
    });
  };

  const handleEventMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEventMedia({
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoEnd = (postId: number) => {
    setPosts(prevPosts => {
      const currentIndex = prevPosts.findIndex(post => post.id === postId);
      const nextIndex = (currentIndex + 1) % prevPosts.length;
      return [
        ...prevPosts.slice(0, currentIndex),
        ...prevPosts.slice(currentIndex + 1),
        prevPosts[currentIndex]
      ];
    });
  };

  const handleLike = (id: number, isEvent: boolean) => {
    const updateItems = isEvent ? setEvents : setPosts;
    updateItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        if (item.likedBy.includes(username)) {
          return {
            ...item,
            likes: item.likes - 1,
            likedBy: item.likedBy.filter(user => user !== username)
          };
        } else {
          return {
            ...item,
            likes: item.likes + 1,
            likedBy: [...item.likedBy, username],
            dislikes: item.dislikedBy.includes(username) ? item.dislikes - 1 : item.dislikes,
            dislikedBy: item.dislikedBy.filter(user => user !== username)
          };
        }
      }
      return item;
    }));
  };

  const handleDislike = (id: number, isEvent: boolean) => {
    const updateItems = isEvent ? setEvents : setPosts;
    updateItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        if (item.dislikedBy.includes(username)) {
          return {
            ...item,
            dislikes: item.dislikes - 1,
            dislikedBy: item.dislikedBy.filter(user => user !== username)
          };
        } else {
          return {
            ...item,
            dislikes: item.dislikes + 1,
            dislikedBy: [...item.dislikedBy, username],
            likes: item.likedBy.includes(username) ? item.likes - 1 : item.likes,
            likedBy: item.likedBy.filter(user => user !== username)
          };
        }
      }
      return item;
    }));
  };

  const handleFollow = (userToFollow: string) => {
    if (!following.includes(userToFollow) && userToFollow !== username) {
      setFollowing(prev => [...prev, userToFollow]);
    }
  };

  const handleUnfollow = (userToUnfollow: string) => {
    setFollowing(prev => prev.filter(user => user !== userToUnfollow));
  };

  const handleAddComment = (postId: number, content: string) => {
    if (content.trim() === '') return; // Don't add empty comments
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: post.comments.length + 1,
              username: username,
              content: content.trim(),
              likes: 0,
              dislikes: 0,
              likedBy: [],
              dislikedBy: []
            }
          ]
        };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleEditPost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPost(postId);
      setEditContent(post.content);
    }
  };

  const handleSaveEditPost = () => {
    if (editingPost !== null) {
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === editingPost ? { ...post, content: editContent } : post
      ));
      setEditingPost(null);
      setEditContent('');
    }
  };

  const handleDeleteComment = (postId: number, commentId: number) => {
    setPosts(prevPosts => prevPosts.map(post =>
      post.id === postId
        ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
        : post
    ));
  };

  const handleEditComment = (postId: number, commentId: number) => {
    const post = posts.find(p => p.id === postId);
    const comment = post?.comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment({ postId, commentId });
      setEditContent(comment.content);
    }
  };

  const handleSaveEditComment = () => {
    if (editingComment) {
      setPosts(prevPosts => prevPosts.map(post =>
        post.id === editingComment.postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === editingComment.commentId
                  ? { ...comment, content: editContent }
                  : comment
              )
            }
          : post
      ));
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleLikeComment = (postId: number, commentId: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              if (comment.likedBy.includes(username)) {
                return {
                  ...comment,
                  likes: comment.likes - 1,
                  likedBy: comment.likedBy.filter(user => user !== username)
                };
              } else {
                return {
                  ...comment,
                  likes: comment.likes + 1,
                  likedBy: [...comment.likedBy, username],
                  dislikes: comment.dislikedBy.includes(username) ? comment.dislikes - 1 : comment.dislikes,
                  dislikedBy: comment.dislikedBy.filter(user => user !== username)
                };
              }
            }
            return comment;
          })
        };
      }
      return post;
    }));
  };

  const handleDislikeComment = (postId: number, commentId: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              if (comment.dislikedBy.includes(username)) {
                return {
                  ...comment,
                  dislikes: comment.dislikes - 1,
                  dislikedBy: comment.dislikedBy.filter(user => user !== username)
                };
              } else {
                return {
                  ...comment,
                  dislikes: comment.dislikes + 1,
                  dislikedBy: [...comment.dislikedBy, username],
                  likes: comment.likedBy.includes(username) ? comment.likes - 1 : comment.likes,
                  likedBy: comment.likedBy.filter(user => user !== username)
                };
              }
            }
            return comment;
          })
        };
      }
      return post;
    }));
  };

  const handleAddEventComment = (eventId: number, content: string) => {
    if (content.trim() === '') return; // Don't add empty comments
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          comments: [
            ...event.comments,
            {
              id: event.comments.length + 1,
              username: username,
              content: content.trim(),
              likes: 0,
              dislikes: 0,
              likedBy: [],
              dislikedBy: []
            }
          ]
        };
      }
      return event;
    }));
  };

  const handleLikeEvent = (eventId: number) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        if (event.likedBy.includes(username)) {
          return {
            ...event,
            likes: event.likes - 1,
            likedBy: event.likedBy.filter(user => user !== username)
          };
        } else {
          return {
            ...event,
            likes: event.likes + 1,
            likedBy: [...event.likedBy, username],
            dislikes: event.dislikedBy.includes(username) ? event.dislikes - 1 : event.dislikes,
            dislikedBy: event.dislikedBy.filter(user => user !== username)
          };
        }
      }
      return event;
    }));
  };

  const handleDislikeEvent = (eventId: number) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        if (event.dislikedBy.includes(username)) {
          return {
            ...event,
            dislikes: event.dislikes - 1,
            dislikedBy: event.dislikedBy.filter(user => user !== username)
          };
        } else {
          return {
            ...event,
            dislikes: event.dislikes + 1,
            dislikedBy: [...event.dislikedBy, username],
            likes: event.likedBy.includes(username) ? event.likes - 1 : event.likes,
            likedBy: event.likedBy.filter(user => user !== username)
          };
        }
      }
      return event;
    }));
  };

  const handleLikeEventComment = (eventId: number, commentId: number) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          comments: event.comments.map(comment => {
            if (comment.id === commentId) {
              if (comment.likedBy.includes(username)) {
                return {
                  ...comment,
                  likes: comment.likes - 1,
                  likedBy: comment.likedBy.filter(user => user !== username)
                };
              } else {
                return {
                  ...comment,
                  likes: comment.likes + 1,
                  likedBy: [...comment.likedBy, username],
                  dislikes: comment.dislikedBy.includes(username) ? comment.dislikes - 1 : comment.dislikes,
                  dislikedBy: comment.dislikedBy.filter(user => user !== username)
                };
              }
            }
            return comment;
          })
        };
      }
      return event;
    }));
  };

  const handleDislikeEventComment = (eventId: number, commentId: number) => {
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          comments: event.comments.map(comment => {
            if (comment.id === commentId) {
              if (comment.dislikedBy.includes(username)) {
                return {
                  ...comment,
                  dislikes: comment.dislikes - 1,
                  dislikedBy: comment.dislikedBy.filter(user => user !== username)
                };
              } else {
                return {
                  ...comment,
                  dislikes: comment.dislikes + 1,
                  dislikedBy: [...comment.dislikedBy, username],
                  likes: comment.likedBy.includes(username) ? comment.likes - 1 : comment.likes,
                  likedBy: comment.likedBy.filter(user => user !== username)
                };
              }
            }
            return comment;
          })
        };
      }
      return event;
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">Facebook</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">Facebook</h1>
          <div className="flex items-center space-x-4">
            <img
              src={profilePic || 'https://via.placeholder.com/40'}
              alt={username}
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setShowSettings(!showSettings)}
            />
            <span className="font-semibold">{username}</span>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.privateProfile}
                  onChange={() => toggleSetting('privateProfile')}
                  className="mr-2"
                />
                Make Profile Private
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.hideLikes}
                  onChange={() => toggleSetting('hideLikes')}
                  className="mr-2"
                />
                Hide Likes
              </label>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.hideDislikes}
                  onChange={() => toggleSetting('hideDislikes')}
                  className="mr-2"
                />
                Hide Dislikes
              </label>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-200 mb-2"
            >
              Logout
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto mt-8 p-4">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowEvents(false)}
            className={`px-4 py-2 rounded-l-md ${!showEvents ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Posts
          </button>
          <button
            onClick={() => setShowEvents(true)}
            className={`px-4 py-2 rounded-r-md ${showEvents ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Events
          </button>
        </div>

        {showEvents ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Create Event</h2>
              <textarea
                value={newEventContent}
                onChange={(e) => setNewEventContent(e.target.value)}
                placeholder="What's your event about?"
                className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleEventMediaUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md mr-2 transition duration-200"
                >
                  Add Media
                </button>
                {newEventMedia && <span className="text-green-500">{newEventMedia.type} added</span>}
              </div>
              {newEventMedia && (
                <input
                  type="text"
                  value={newEventOverlayText}
                  onChange={(e) => setNewEventOverlayText(e.target.value)}
                  placeholder="Add text overlay"
                  className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <button
                onClick={handleAddEvent}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
              >
                Create Event
              </button>
            </div>

            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow-md border-2 border-yellow-500">
                  <div className="flex items-center mb-3">
                    <img
                      src={event.authorProfilePic || 'https://via.placeholder.com/40'}
                      alt={event.username}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h2 className="font-semibold">{event.username}</h2>
                      <p className="text-gray-500 text-sm">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="ml-auto text-yellow-600 font-semibold">Event</span>
                    {event.author === username && <span className="ml-auto text-blue-600 font-semibold">Your Event</span>}
                  </div>
                  <p className="mb-3">{event.content}</p>
                  {event.media && (
                    <div className="relative mb-3">
                      <img 
                        src={event.media.url} 
                        alt="Event" 
                        className="w-full rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                        }}
                      />
                      {event.media.overlayText && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          {event.media.overlayText}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => handleLikeEvent(event.id)}
                      className={`${event.likedBy.includes(username) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1 rounded-md transition duration-200`}
                    >
                      👍 Like {(event.author !== username || !userPreferences.hideLikes) && `(${event.likes})`}
                    </button>
                    <button
                      onClick={() => handleDislikeEvent(event.id)}
                      className={`${event.dislikedBy.includes(username) ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1 rounded-md transition duration-200`}
                    >
                      👎 Dislike {(event.author !== username || !userPreferences.hideDislikes) && `(${event.dislikes})`}
                    </button>
                    {event.author !== username && (
                      following.includes(event.author) ? (
                        <button
                          onClick={() => handleUnfollow(event.author)}
                          className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition duration-200"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(event.author)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition duration-200"
                        >
                          Follow
                        </button>
                      )
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Comments</h3>
                    {event.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-2 rounded-md mb-2">
                        <span className="font-semibold">{comment.username}: </span>
                        {comment.content}
                        <div className="mt-1 flex space-x-2">
                          <button
                            onClick={() => handleLikeEventComment(event.id, comment.id)}
                            className={`${comment.likedBy.includes(username) ? 'text-blue-600' : 'text-gray-600'} text-sm`}
                          >
                            👍 Like {(comment.username !== username || !userPreferences.hideLikes) && `(${comment.likes})`}
                          </button>
                          <button
                            onClick={() => handleDislikeEventComment(event.id, comment.id)}
                            className={`${comment.dislikedBy.includes(username) ? 'text-red-600' : 'text-gray-600'} text-sm`}
                          >
                            👎 Dislike {(comment.username !== username || !userPreferences.hideDislikes) && `(${comment.dislikes})`}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex mt-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddEventComment(event.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition duration-200"
                        onClick={(e) => {
                          const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                          handleAddEventComment(event.id, input.value);
                          input.value = '';
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-bold mb-4">Create Post</h2>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddPost}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
              >
                Post
              </button>
            </div>

            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center mb-3">
                    <img
                      src={post.authorProfilePic || 'https://via.placeholder.com/40'}
                      alt={post.username}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h2 className="font-semibold">{post.username}</h2>
                      <p className="text-gray-500 text-sm">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {post.author === username && <span className="ml-auto text-blue-600 font-semibold">Your Post</span>}
                  </div>
                  {editingPost === post.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                      />
                      <button
                        onClick={handleSaveEditPost}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="mb-3">{post.content}</p>
                  )}
                  <div className="flex space-x-2 mb-3">
                    <button
                      onClick={() => handleLike(post.id, false)}
                      className={`${post.likedBy.includes(username) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1 rounded-md transition duration-200`}
                    >
                      👍 Like {(post.author !== username || !userPreferences.hideLikes) && `(${post.likes})`}
                    </button>
                    <button
                      onClick={() => handleDislike(post.id, false)}
                      className={`${post.dislikedBy.includes(username) ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-gray-200'} px-3 py-1 rounded-md transition duration-200`}
                    >
                      👎 Dislike {(post.author !== username || !userPreferences.hideDislikes) && `(${post.dislikes})`}
                    </button>
                    {post.author !== username && (
                      following.includes(post.author) ? (
                        <button
                          onClick={() => handleUnfollow(post.author)}
                          className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition duration-200"
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFollow(post.author)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition duration-200"
                        >
                          Follow                        </button>
                      )
                    )}
                    {post.author === username && (
                      <>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-200"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditPost(post.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition duration-200"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Comments</h3>
                    {post.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 p-2 rounded-md mb-2">
                        <span className="font-semibold">{comment.username}: </span>
                        {editingComment?.postId === post.id && editingComment?.commentId === comment.id ? (
                          <div>
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-1 border rounded mb-1"
                            />
                            <button
                              onClick={handleSaveEditComment}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          comment.content
                        )}
                        {comment.username === username && (
                          <div className="mt-1">
                            <button
                              onClick={() => handleDeleteComment(post.id, comment.id)}
                              className="text-red-600 text-sm mr-2"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleEditComment(post.id, comment.id)}
                              className="text-blue-600 text-sm"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        <div className="mt-1 flex space-x-2">
                          <button
                            onClick={() => handleLikeComment(post.id, comment.id)}
                            className={`${comment.likedBy.includes(username) ? 'text-blue-600' : 'text-gray-600'} text-sm`}
                          >
                            👍 Like {(comment.username !== username || !userPreferences.hideLikes) && `(${comment.likes})`}
                          </button>
                          <button
                            onClick={() => handleDislikeComment(post.id, comment.id)}
                            className={`${comment.dislikedBy.includes(username) ? 'text-red-600' : 'text-gray-600'} text-sm`}
                          >
                            👎 Dislike {(comment.username !== username || !userPreferences.hideDislikes) && `(${comment.dislikes})`}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex mt-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition duration-200"
                        onClick={(e) => {
                          const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                          handleAddComment(post.id, input.value);
                          input.value = '';
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FacebookApp;