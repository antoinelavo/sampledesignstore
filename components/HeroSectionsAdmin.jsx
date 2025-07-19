import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/HeroSection';

const HeroSectionsAdmin = () => {
  const [heroSections, setHeroSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newSection, setNewSection] = useState({
    page_name: '',
    title: '',
    subtitle: '',
    image_url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  // Image upload function (reusing from main admin)
  const uploadImage = async (file, folder = 'hero') => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle hero image upload
  const handleHeroImageUpload = async (file, isEdit = false) => {
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'hero');
      
      if (isEdit) {
        setEditForm(prev => ({ ...prev, image_url: imageUrl }));
      } else {
        setNewSection(prev => ({ ...prev, image_url: imageUrl }));
      }
      
      setSuccess('Hero image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to upload hero image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Fetch all hero sections
  const fetchHeroSections = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { data, error } = await supabase
        .from('hero_sections')
        .select('*')
        .order('page_name');
      
      if (error) throw error;
      
      setHeroSections(data || []);
    } catch (error) {
      console.error('Error fetching hero sections:', error);
      setError('Failed to fetch hero sections: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new hero section
  const handleAddSection = async () => {
    if (!newSection.page_name || !newSection.image_url) {
      setError('Please fill in page name and upload an image');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hero_sections')
        .insert([{
          page_name: newSection.page_name,
          title: newSection.title || null,
          subtitle: newSection.subtitle || null,
          image_url: newSection.image_url
        }]);

      if (error) throw error;

      setNewSection({ page_name: '', title: '', subtitle: '', image_url: '' });
      setShowAddForm(false);
      setSuccess('Hero section added successfully!');
      setError('');
      fetchHeroSections();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add hero section: ' + error.message);
      setSuccess('');
    }
  };

  // Start editing
  const startEdit = (section) => {
    setEditingId(section.id);
    setEditForm({ 
      page_name: section.page_name,
      title: section.title || '',
      subtitle: section.subtitle || '',
      image_url: section.image_url
    });
    setError('');
    setSuccess('');
  };

  // Save edited section
  const saveEdit = async () => {
    if (!editForm.page_name || !editForm.image_url) {
      setError('Please fill in page name and upload an image');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hero_sections')
        .update({
          page_name: editForm.page_name,
          title: editForm.title || null,
          subtitle: editForm.subtitle || null,
          image_url: editForm.image_url
        })
        .eq('id', editingId);

      if (error) throw error;

      setEditingId(null);
      setEditForm({});
      setSuccess('Hero section updated successfully!');
      setError('');
      fetchHeroSections();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update hero section: ' + error.message);
      setSuccess('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Delete section
  const deleteSection = async (id) => {
    if (!confirm('Are you sure you want to delete this hero section?')) return;

    try {
      const { error } = await supabase
        .from('hero_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Hero section deleted successfully!');
      setError('');
      fetchHeroSections();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete hero section: ' + error.message);
      setSuccess('');
    }
  };

  useEffect(() => {
    fetchHeroSections();
  }, []);

  const ImageUploadSection = ({ title, currentImage, onUpload, isEdit = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e.target.files[0], isEdit)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        {uploading && <span className="text-sm text-purple-600">Uploading...</span>}
      </div>
      {currentImage && (
        <div className="mt-2">
          <img src={currentImage} alt="Hero Preview" className="w-32 h-20 object-cover rounded border" />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">Loading hero sections...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">히어로 섹션 관리</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          히어로 섹션 추가
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError('')} className="ml-4 text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
          <button onClick={() => setSuccess('')} className="ml-4 text-green-500 hover:text-green-700">×</button>
        </div>
      )}

      {/* Add New Section Form */}
      {showAddForm && (
        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">새 히어로 섹션 추가</h3>
          
          {/* Quick Add Presets */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">빠른 추가 (일반적인 페이지)</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setNewSection({...newSection, page_name: 'home'})}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                홈페이지
              </button>
              <button
                onClick={() => setNewSection({...newSection, page_name: 'kennel-club'})}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Kennel Club
              </button>
              <button
                onClick={() => setNewSection({...newSection, page_name: 'kennel-club-dog'})}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Kennel Club - Dog
              </button>
              <button
                onClick={() => setNewSection({...newSection, page_name: 'kennel-club-cat'})}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Kennel Club - Cat
              </button>
              <button
                onClick={() => setNewSection({...newSection, page_name: 'clothing'})}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Clothing
              </button>
              <button
                onClick={() => setNewSection({...newSection, page_name: 'clothing-shirts'})}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Clothing - Shirts
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="페이지 이름 (예: home, kennel-club, clothing)"
                value={newSection.page_name}
                onChange={(e) => setNewSection({...newSection, page_name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="제목 (선택사항)"
                value={newSection.title}
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <textarea
                placeholder="부제목 (선택사항)"
                value={newSection.subtitle}
                onChange={(e) => setNewSection({...newSection, subtitle: e.target.value})}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            <ImageUploadSection
              title="히어로 이미지"
              currentImage={newSection.image_url}
              onUpload={handleHeroImageUpload}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddSection}
              disabled={uploading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {uploading ? '업로드 중...' : '추가'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSection({ page_name: '', title: '', subtitle: '', image_url: '' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Hero Sections List */}
      {editingId ? (
        // Edit Form Modal
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">히어로 섹션 수정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="페이지 이름"
                  value={editForm.page_name || ''}
                  onChange={(e) => setEditForm({...editForm, page_name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="제목 (선택사항)"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <textarea
                  placeholder="부제목 (선택사항)"
                  value={editForm.subtitle || ''}
                  onChange={(e) => setEditForm({...editForm, subtitle: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <ImageUploadSection
                title="히어로 이미지"
                currentImage={editForm.image_url}
                onUpload={handleHeroImageUpload}
                isEdit={true}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveEdit}
                disabled={uploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {uploading ? '업로드 중...' : '저장'}
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Hero Sections Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heroSections.map((section) => (
            <div key={section.id} className="border rounded-lg p-4 relative group">
              {/* Admin Controls */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => startEdit(section)}
                  className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Hero Section Preview */}
              <div className="aspect-video rounded overflow-hidden mb-3 relative">
                <HeroSection
                  pageName={section.page_name}
                  title={section.title}
                  subtitle={section.subtitle}
                  fallbackImage={section.image_url}
                  showOverlay={true}
                  className="!min-h-full !h-full [&_h1]:!text-lg [&_h1]:!md:text-xl [&_p]:!text-sm [&_p]:!md:text-sm"
                />
              </div>

              {/* Page Info */}
              <div>
                <h4 className="font-semibold text-gray-900 capitalize mb-1">
                  {section.page_name.replace('-', ' ')}
                </h4>
                {section.title && (
                  <p className="text-sm text-gray-700 font-medium truncate mb-1">
                    제목: {section.title}
                  </p>
                )}
                {section.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    부제목: {section.subtitle}
                  </p>
                )}
                <p className="text-xs text-gray-400 truncate">
                  {section.image_url}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {heroSections.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-xl mb-4">히어로 섹션이 없습니다</p>
          <p>위의 버튼을 사용해서 첫 번째 히어로 섹션을 추가해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default HeroSectionsAdmin;