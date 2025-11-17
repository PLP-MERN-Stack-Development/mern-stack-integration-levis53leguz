import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function PostForm(){
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  React.useEffect(() => {
    if (id) {
      api.get(`/posts/${id}`).then(r => {
        setValue('title', r.data.title);
        setValue('content', r.data.content);
        // categories, etc.
      })
    }
  }, [id]);

  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('content', data.content);
    if (data.featuredImage?.[0]) fd.append('featuredImage', data.featuredImage[0]);
    if (id) {
      await api.put(`/posts/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      <textarea {...register('content')} placeholder="Content" />
      <input type="file" {...register('featuredImage')} />
      <button type="submit">Save</button>
    </form>
  )
}
