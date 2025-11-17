import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

export default function Home(){
  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page:1, pages:1 });
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchPosts(1);
  }, []);

  async function fetchPosts(page=1){
    const res = await api.get(`/posts?page=${page}&limit=8${query ? `&search=${encodeURIComponent(query)}` : ''}`);
    setPosts(res.data.items); setMeta({ page: res.data.page, pages: res.data.pages });
  }

  return (
    <div>
      <h1>Latest posts</h1>
      <div>
        {posts.map(p => <PostCard key={p._id} post={p} onDelete={() => {/* optimistic remove */}} />)}
      </div>
      <Pagination page={meta.page} pages={meta.pages} onPage={p => fetchPosts(p)} />
    </div>
  )
}
