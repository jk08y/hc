// src/components/common/LinkPreview.jsx
import React, { useState, useEffect } from 'react';
import { FaLink } from 'react-icons/fa';

const LinkPreview = ({ url }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!url) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const html = data.contents;

        if (!html) {
          throw new Error('Could not fetch link metadata.');
        }

        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        const getMetaTag = (name) => {
            const el = doc.querySelector(`meta[property="og:${name}"]`) || doc.querySelector(`meta[name="${name}"]`);
            return el ? el.getAttribute('content') : null;
        }

        const title = getMetaTag('title') || doc.querySelector('title')?.textContent || 'No title found';
        const description = getMetaTag('description') || 'No description available';
        const image = getMetaTag('image');
        const siteName = getMetaTag('site_name') || new URL(url).hostname;

        setPreview({
          title: title.slice(0, 100),
          description: description.slice(0, 200),
          image,
          siteName
        });

      } catch (err) {
        setError('Could not load link preview.');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className="mt-3 border border-gray-200 dark:border-dark-border rounded-2xl animate-pulse">
        <div className="bg-gray-200 dark:bg-dark-border h-32 w-full"></div>
        <div className="p-3">
          <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return null;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-3 border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden hover:bg-gray-50 dark:hover:bg-dark-light transition-colors">
      {preview.image && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-dark-border">
          <img src={preview.image} alt={preview.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-secondary truncate">{preview.siteName}</p>
        <p className="font-bold text-gray-900 dark:text-white truncate">{preview.title}</p>
        <p className="text-sm text-secondary truncate">{preview.description}</p>
      </div>
    </a>
  );
};

export default LinkPreview;
