import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  Settings, 
  Check, 
  Search, 
  Eye,
  EyeOff,
  Camera,
  Image as ImageIcon,
  ShoppingBag,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  XCircle,
  RotateCcw,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
  TrendingUp,
  LayoutGrid,
  Users,
  FileText,
  Award,
  Sparkles,
  ExternalLink,
  Menu,
  ChevronRight
} from 'lucide-react';
import { useStore, ORDER_STAGES } from '../context/StoreContext';
import { FashionPlaceholder } from './Placeholders';
import { api } from '../services/api';

// Client-side image compression helper: keeps aspect ratio, max 1200px, quality JPEG
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const AdminPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    products, 
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    orders,
    updateOrderDecision,
    updateOrderStage,
    deleteOrder,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    storeConfig, 
    setStoreConfig, 
    showToast,
    dbStatus,
    syncWithDatabase
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    navigate('/');
  };

  // Super Secure Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Settings: Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState(null);

  // 8 Admin Tabs matching the user uploaded reference
  // 'dashboard' | 'inventory' | 'categories' | 'orders' | 'accounts' | 'blogs' | 'affiliate' | 'settings'
  const [adminTab, setAdminTab] = useState('dashboard');

  // Search & Filters
  const [adminSearch, setAdminSearch] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Ref inputs for camera and gallery
  const fileInputCameraRef = useRef(null);
  const fileInputGalleryRef = useRef(null);

  // Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'Kurtas',
    categorySlug: 'kurtas',
    price: '',
    originalPrice: '',
    stock: '10',
    description: '',
    images: []
  });

  // Category Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    subtitle: '',
    imageUrl: ''
  });

  // Blog / Story Form State
  const [blogs, setBlogs] = useState(() => {
    try {
      const saved = localStorage.getItem('taaga_admin_blogs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'blog_1',
        title: 'The Art of Bandhani & Golden Zari',
        category: 'TEXTILE CRAFTSMANSHIP',
        subtitle: 'Exploring traditional tie-dye resist techniques from Kutch to Pune.',
        readTime: '3 min read',
        imageUrl: '/category-kurtas.jpg',
        published: true,
        date: 'Nov 2026'
      },
      {
        id: 'blog_2',
        title: 'Mother, Daughter & Morning Chai',
        category: 'BEHIND THE LABEL',
        subtitle: 'How kitchen conversations about forgotten heirloom silhouettes turned into House of Taaga.',
        readTime: '4 min read',
        imageUrl: '/founders.jpg',
        published: true,
        date: 'Oct 2026'
      },
      {
        id: 'blog_3',
        title: 'Six Yards of Handwoven Poetry',
        category: 'EDITORIAL LOOKBOOK',
        subtitle: 'The meditative rhythm of Chanderi looms and hand-beaded borders.',
        readTime: '3 min read',
        imageUrl: '/category-sarees.jpg',
        published: true,
        date: 'Sep 2026'
      },
      {
        id: 'blog_4',
        title: 'Festive Kaftans in Natural Light',
        category: 'SLOW FASHION',
        subtitle: 'Bridging effortless contemporary fits with hand-embroidered Kashmiri and royal zari yokes.',
        readTime: '5 min read',
        imageUrl: '/category-festive.jpg',
        published: true,
        date: 'Aug 2026'
      }
    ];
  });

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'TEXTILE CRAFTSMANSHIP',
    subtitle: '',
    readTime: '3 min read',
    imageUrl: '/category-kurtas.jpg'
  });

  // Affiliates State
  const [affiliates, setAffiliates] = useState(() => {
    try {
      const saved = localStorage.getItem('taaga_admin_affiliates');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'aff_1',
        name: 'Priya Kulkarni',
        role: 'Pune Fashion Stylist',
        code: 'PRIYA10',
        discount: '10% OFF',
        sales: 24800,
        commission: 2480,
        ordersCount: 9,
        status: 'Active'
      },
      {
        id: 'aff_2',
        name: 'Heritage Drapes India',
        role: 'Textile Curator',
        code: 'HERITAGE15',
        discount: '15% OFF',
        sales: 41200,
        commission: 4120,
        ordersCount: 14,
        status: 'Active'
      },
      {
        id: 'aff_3',
        name: 'Rhea Deshmukh',
        role: 'Ethnic Lookbook Creator',
        code: 'RHEA10',
        discount: '10% OFF',
        sales: 18900,
        commission: 1890,
        ordersCount: 6,
        status: 'Active'
      }
    ];
  });

  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [affiliateForm, setAffiliateForm] = useState({
    name: '',
    role: '',
    code: '',
    discount: '10% OFF'
  });

  // Save blogs to localStorage
  const saveBlogs = (updated) => {
    setBlogs(updated);
    try {
      localStorage.setItem('taaga_admin_blogs', JSON.stringify(updated));
    } catch (e) {}
  };

  // Save affiliates to localStorage
  const saveAffiliates = (updated) => {
    setAffiliates(updated);
    try {
      localStorage.setItem('taaga_admin_affiliates', JSON.stringify(updated));
    } catch (e) {}
  };

  // Check auth session
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = sessionStorage.getItem('kundan_admin_token');
        if (token) {
          const res = await api.adminVerify(token);
          if (res && res.valid) {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        // Fallback
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkToken();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!authPassword.trim()) {
      setAuthError('Please enter admin password');
      return;
    }
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const res = await api.adminLogin(authPassword);
      if (res && res.success && res.token) {
        sessionStorage.setItem('kundan_admin_token', res.token);
        setIsAuthenticated(true);
        setAuthPassword('');
        showToast('Admin access granted', 'success');
      } else {
        setAuthError(res?.error || 'Invalid password');
      }
    } catch (err) {
      setAuthError(err.message || 'Incorrect password or authentication error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLockAdmin = async () => {
    const token = sessionStorage.getItem('kundan_admin_token');
    await api.adminLogout(token);
    sessionStorage.removeItem('kundan_admin_token');
    setIsAuthenticated(false);
    showToast('Admin panel locked');
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncWithDatabase();
      showToast('Database synced successfully');
    } catch (err) {
      showToast('Offline cache active', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Change Admin Password in Settings / Accounts
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassFeedback(null);
    if (!currentPassword) {
      const msg = 'Please enter current admin password';
      setPassFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long';
      setPassFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = 'New passwords do not match';
      setPassFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
      return;
    }
    setIsChangingPass(true);
    try {
      const token = sessionStorage.getItem('kundan_admin_token');
      const res = await api.adminChangePassword({ currentPassword, newPassword }, token);
      if (res && res.success) {
        if (res.token) {
          sessionStorage.setItem('kundan_admin_token', res.token);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        const msg = 'Admin password updated successfully! Use your new password on next login.';
        setPassFeedback({ type: 'success', message: msg });
        showToast('Admin password updated successfully!', 'success');
      } else {
        const msg = res?.error || 'Failed to update password';
        setPassFeedback({ type: 'error', message: msg });
        showToast(msg, 'error');
      }
    } catch (err) {
      const msg = err.message || 'Failed to update password';
      setPassFeedback({ type: 'error', message: msg });
      showToast(msg, 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Product Handlers
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      category: 'Kurtas',
      categorySlug: 'kurtas',
      price: '',
      originalPrice: '',
      stock: '10',
      description: '',
      images: []
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod.id);
    const existingImages = Array.isArray(prod.images) && prod.images.length > 0
      ? prod.images
      : (prod.imageUrl ? [prod.imageUrl] : []);

    setProductForm({
      title: prod.title || prod.name || '',
      category: prod.category || 'Kurtas',
      categorySlug: prod.categorySlug || 'kurtas',
      price: prod.price ?? '',
      originalPrice: prod.originalPrice ?? prod.price ?? '',
      stock: prod.stock !== undefined ? String(prod.stock) : (prod.inStock === false ? '0' : '10'),
      description: prod.description || '',
      images: existingImages
    });
    setIsProductModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 3 - productForm.images.length;
    if (remainingSlots <= 0) {
      showToast('Maximum 3 photos allowed per product', 'error');
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    try {
      showToast('Optimizing photo...', 'info');
      const compressedDataUrls = await Promise.all(filesToProcess.map(f => compressImage(f)));
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...compressedDataUrls]
      }));
      showToast(`${filesToProcess.length} photo(s) added successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Error processing photo', 'error');
    }

    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleProductFormSubmit = (e) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      showToast('Product title is required', 'error');
      return;
    }
    const priceNum = Number(productForm.price);
    if (isNaN(priceNum) || priceNum < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    const origPriceNum = productForm.originalPrice ? Number(productForm.originalPrice) : priceNum;
    const stockNum = parseInt(productForm.stock, 10) || 0;

    const payload = {
      title: productForm.title.trim(),
      name: productForm.title.trim(),
      category: productForm.category,
      categorySlug: productForm.categorySlug,
      price: priceNum,
      originalPrice: origPriceNum >= priceNum ? origPriceNum : priceNum,
      stock: stockNum,
      inStock: stockNum > 0,
      description: productForm.description.trim(),
      images: productForm.images,
      imageUrl: productForm.images[0] || ''
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
      showToast('Product updated successfully!');
    } else {
      addProduct({
        ...payload,
        id: `prod_${Date.now()}`
      });
      showToast('New product added to catalog!');
    }

    setIsProductModalOpen(false);
  };

  const handleToggleProductStock = (prod) => {
    const isCurrentlyInStock = (prod.stock ?? 10) > 0;
    const nextStock = isCurrentlyInStock ? 0 : 10;
    updateProduct(prod.id, {
      ...prod,
      stock: nextStock,
      inStock: nextStock > 0
    });
    showToast(nextStock > 0 ? `Marked in stock (${prod.title})` : `Marked out of stock (${prod.title})`);
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      slug: '',
      subtitle: '',
      imageUrl: '/category-kurtas.jpg'
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    const slug = categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      name: categoryForm.name.trim(),
      slug,
      subtitle: categoryForm.subtitle.trim(),
      imageUrl: categoryForm.imageUrl.trim() || '/category-kurtas.jpg'
    };

    if (editingCategoryId) {
      if (updateCategory) updateCategory(editingCategoryId, payload);
      showToast('Category updated!');
    } else {
      if (addCategory) addCategory({ ...payload, id: `cat_${Date.now()}` });
      showToast('Category added!');
    }
    setIsCategoryModalOpen(false);
  };

  // Blog Handlers
  const handleOpenAddBlog = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      category: 'TEXTILE CRAFTSMANSHIP',
      subtitle: '',
      readTime: '3 min read',
      imageUrl: '/category-kurtas.jpg'
    });
    setIsBlogModalOpen(true);
  };

  const handleBlogSubmit = (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return;
    if (editingBlogId) {
      saveBlogs(blogs.map(b => b.id === editingBlogId ? { ...b, ...blogForm } : b));
      showToast('Story updated!');
    } else {
      const newBlog = {
        ...blogForm,
        id: `blog_${Date.now()}`,
        published: true,
        date: 'Today'
      };
      saveBlogs([newBlog, ...blogs]);
      showToast('New story published to The Taaga Journal!');
    }
    setIsBlogModalOpen(false);
  };

  // Affiliate Handlers
  const handleOpenAddAffiliate = () => {
    setAffiliateForm({
      name: '',
      role: '',
      code: '',
      discount: '10% OFF'
    });
    setIsAffiliateModalOpen(true);
  };

  const handleAffiliateSubmit = (e) => {
    e.preventDefault();
    if (!affiliateForm.name.trim() || !affiliateForm.code.trim()) return;
    const newAff = {
      id: `aff_${Date.now()}`,
      name: affiliateForm.name.trim(),
      role: affiliateForm.role.trim() || 'Brand Partner',
      code: affiliateForm.code.trim().toUpperCase(),
      discount: affiliateForm.discount,
      sales: 0,
      commission: 0,
      ordersCount: 0,
      status: 'Active'
    };
    saveAffiliates([...affiliates, newAff]);
    showToast(`Affiliate code ${newAff.code} created!`);
    setIsAffiliateModalOpen(false);
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.decision === 'pending').length;
  const acceptedOrdersCount = orders.filter(o => o.decision === 'accepted').length;

  const filteredAdminProducts = products.filter(p => {
    if (!p) return false;
    if (!adminSearch.trim()) return true;
    const q = adminSearch.toLowerCase();
    const t = (p.title || p.name || '').toLowerCase();
    const c = (p.category || '').toLowerCase();
    return t.includes(q) || c.includes(q);
  });

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    if (orderStatusFilter !== 'all' && order.decision !== orderStatusFilter) return false;
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    const id = String(order.id || '').toLowerCase();
    const name = String(order.customerName || '').toLowerCase();
    const phone = String(order.phone || '').toLowerCase();
    return id.includes(q) || name.includes(q) || phone.includes(q);
  });

  // Extract unique customer accounts from orders
  const customerAccounts = orders.reduce((acc, order) => {
    const key = order.phone || order.customerName;
    if (!key) return acc;
    if (!acc[key]) {
      acc[key] = {
        name: order.customerName || 'Customer',
        phone: order.phone || '',
        address: order.shippingAddress || 'Pune, India',
        ordersCount: 1,
        totalSpent: Number(order.total) || 0,
        lastOrderDate: order.date || 'Recent'
      };
    } else {
      acc[key].ordersCount += 1;
      acc[key].totalSpent += Number(order.total) || 0;
    }
    return acc;
  }, {});

  const customerList = Object.values(customerAccounts);

  // The 8 Tabs Config (Exact match to uploaded image)
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: products.length },
    { id: 'categories', label: 'Categories', icon: LayoutGrid, badge: categories.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : orders.length },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'blogs', label: 'Blogs', icon: FileText, badge: blogs.length },
    { id: 'affiliate', label: 'Affiliate', icon: Award, badge: affiliates.length },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  // 1. Password Guard Screen
  if (!isAuthenticated && !isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-50 bg-[#18060B]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#E8D9C8] text-center">
          
          <div className="flex justify-center mb-3">
            <img 
              src="/logo-transparent.png" 
              alt="House of Taaga" 
              className="h-12 w-auto object-contain" 
            />
          </div>

          <span className="text-[10px] font-sans font-bold tracking-[0.2em] uppercase text-[#B65A37] block mb-1">
            Studio Admin Portal
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#382017]">
            Admin Access
          </h2>
          <p className="text-xs text-[#8C6F5A] mt-1 mb-5 font-light">
            Enter master admin password to access dashboard, inventory, and orders.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showAuthPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => {
                    setAuthPassword(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Master admin password"
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 bg-[#FAF2E9]/60 border border-[#E8D9C8] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A37]/30 text-[#382017]"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600 p-0.5 cursor-pointer"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-left flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#B65A37] hover:bg-[#A7472B] active:bg-[#8C3E20] text-white rounded-full text-xs uppercase tracking-wider font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Panel</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#F0E4D5] text-center flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69B52]" />
            <span>Encrypted Web Crypto Verification</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#F8FAFC] flex font-sans">
      
      {/* ========================================================
          LEFT SIDEBAR (EXACT MATCH TO UPLOADED IMAGE)
          Desktop / Tablet vertical navigation
         ======================================================== */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E2E8F0] flex-col justify-between shrink-0 select-none">
        
        {/* Sidebar Top: Brand & Menu */}
        <div className="p-4">
          
          {/* Brand Header */}
          <div className="pb-4 mb-4 border-b border-[#F1F5F9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo-transparent.png" 
                alt="House of Taaga" 
                className="h-9 w-auto object-contain" 
              />
              <div>
                <p className="text-[9px] text-[#B65A37] font-bold tracking-widest uppercase">
                  Pune Studio
                </p>
                <p className="text-[11px] text-neutral-400 font-sans">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          {/* Nav Tabs List matching screenshot */}
          <nav className="space-y-1">
            {navTabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = adminTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#EAF4ED] text-[#1B5E3C] font-semibold rounded-xl shadow-2xs'
                      : 'text-[#4A5568] hover:bg-neutral-100/80 hover:text-neutral-900 rounded-xl font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#1B5E3C]' : 'text-[#4A5568]'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive 
                        ? 'bg-[#1B5E3C] text-white' 
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Bottom: Status & Quick Controls */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#FAF2E9]/30 space-y-2">
          
          {/* DB Status Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`} />
              <span className="text-neutral-600 font-medium">
                {dbStatus === 'connected' ? 'PostgreSQL Live' : 'Local Storage Cache'}
              </span>
            </div>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Sync Database"
              className="p-1 hover:text-[#B65A37] transition-colors cursor-pointer"
            >
              <RotateCcw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleLockAdmin}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#B65A37] hover:bg-[#A7472B] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
          </div>
        </div>

      </aside>

      {/* ========================================================
          MAIN CONTENT AREA (WITH TOP BAR)
         ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Bar on Mobile & Desktop */}
        <header className="relative bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 z-10 h-16">
          
          {/* Left: Mobile hamburger & Active Tab label */}
          <div className="flex items-center gap-3 z-10">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-1 text-neutral-700 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors lg:hidden cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-[#1C1E21] capitalize">
                {navTabs.find(t => t.id === adminTab)?.label || 'Dashboard'}
              </h1>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-[#EAF4ED] text-[#1B5E3C] font-semibold font-sans tracking-wide uppercase">
                Active
              </span>
            </div>
          </div>

          {/* Center: Official House of Taaga Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none sm:pointer-events-auto">
            <button
              type="button"
              onClick={() => setAdminTab('dashboard')}
              className="flex items-center justify-center p-1 hover:opacity-85 transition-opacity cursor-pointer pointer-events-auto"
              title="House of Taaga"
            >
              <img
                src="/logo-transparent.png"
                alt="House of Taaga"
                className="h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[170px] object-contain drop-shadow-2xs"
              />
            </button>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Sync Database"
              className="p-2 text-neutral-500 hover:text-[#B65A37] rounded-xl hover:bg-neutral-100 transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#B65A37]' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Product</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="View Store / Close"
              title="Return to Store"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* Scrollable Main Views Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* ========================================================
              TAB 1: DASHBOARD
             ======================================================== */}
          {adminTab === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Revenue */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Total Revenue
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#1C1E21]">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    +18% from last month
                  </p>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Orders
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#1C1E21]">
                    {orders.length}
                  </div>
                  <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    {pendingOrdersCount} pending confirmation
                  </p>
                </div>

                {/* Total Inventory */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Inventory
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#1C1E21]">
                    {products.length}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                    {products.filter(p => (p.stock ?? 10) > 0).length} in stock
                  </p>
                </div>

                {/* Categories */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Categories
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-[#1C1E21]">
                    {categories.length}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                    Kurtas, Sarees, Co-ords, Festive
                  </p>
                </div>

              </div>

              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-[#FAF2E9] to-[#FFF9F2] p-5 rounded-2xl border border-[#E8D9C8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B65A37] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#382017]">
                      Welcome to House of Taaga Admin
                    </h3>
                    <p className="text-xs text-[#8C6F5A] font-light">
                      Manage inventory, fulfill orders, publish journal stories, and configure boutique settings.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdminTab('orders')}
                    className="px-4 py-2 bg-white hover:bg-neutral-50 text-[#382017] border border-[#E8D9C8] rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                  >
                    View Orders ({orders.length})
                  </button>
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2 bg-[#B65A37] hover:bg-[#A7472B] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                  >
                    + Add New Piece
                  </button>
                </div>
              </div>

              {/* Recent Orders Snapshot */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1C1E21]">
                      Recent Customer Orders
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Live orders received from storefront & WhatsApp checkout
                    </p>
                  </div>
                  <button
                    onClick={() => setAdminTab('orders')}
                    className="text-xs text-[#1B5E3C] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Manage all orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-neutral-400 text-xs">
                    No orders placed yet. New orders will appear here automatically.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-mono font-bold text-neutral-900 block">
                            #{o.id}
                          </span>
                          <span className="text-neutral-500">
                            {o.customerName || 'Customer'} • {o.items?.length || 1} item(s)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-neutral-900 block">
                            ₹{(o.total || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {o.decision || 'Confirmed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: INVENTORY (PRODUCT CATALOG)
             ======================================================== */}
          {adminTab === 'inventory' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              
              {/* Search & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search inventory by title or collection..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E3C]/30"
                  />
                  {adminSearch && (
                    <button 
                      onClick={() => setAdminSearch('')}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdminProducts.map(prod => {
                  const hasImage = prod.images && prod.images.length > 0;
                  const displayImage = hasImage ? prod.images[0] : prod.imageUrl;
                  const inStock = (prod.stock ?? 10) > 0;

                  return (
                    <div 
                      key={prod.id} 
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs hover:border-[#1B5E3C]/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-3 items-start">
                          <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-[#F1F5F9] border border-[#E2E8F0] relative">
                            {displayImage ? (
                              <img 
                                src={displayImage} 
                                alt={prod.title} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <FashionPlaceholder 
                                type="kurta" 
                                imageUrl={prod.imageUrl}
                                alt={prod.title} 
                                className="w-full h-full object-cover" 
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">
                              {prod.category || 'Collection'}
                            </span>
                            <h4 className="font-medium text-sm text-[#1C1E21] line-clamp-2 leading-snug">
                              {prod.title}
                            </h4>

                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="font-bold text-sm text-[#B65A37]">
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                              {prod.originalPrice > prod.price && (
                                <span className="text-xs text-neutral-400 line-through">
                                  ₹{Number(prod.originalPrice).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleProductStock(prod)}
                              className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-medium transition-all cursor-pointer ${
                                inStock 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{inStock ? `In Stock (${prod.stock ?? 10})` : 'Out of Stock'}</span>
                            </button>
                          </div>
                        </div>

                        {prod.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-2 font-light">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-[#F1F5F9]">
                        <button
                          onClick={() => {
                            if (onClose) onClose();
                            navigate(`/product/${prod.id}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-[11px] font-medium text-[#1B5E3C] bg-[#EAF4ED] hover:bg-[#1B5E3C] hover:text-white rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${prod.title}"?`)) {
                                deleteProduct(prod.id);
                                showToast('Product deleted');
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {filteredAdminProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-6">
                    <Package className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-neutral-700">No products found</p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="mt-3 px-5 py-2 bg-[#1B5E3C] text-white rounded-xl text-xs font-semibold"
                    >
                      + Add First Product
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: CATEGORIES
             ======================================================== */}
          {adminTab === 'categories' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h3 className="font-bold text-base text-[#1C1E21]">
                    Store Collections & Categories
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Mughal arch categories displayed on the storefront
                  </p>
                </div>
                <button
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const itemsCount = products.filter(p => (p.categorySlug || p.category || '').toLowerCase() === cat.slug.toLowerCase()).length;

                  return (
                    <div 
                      key={cat.id || cat.slug}
                      className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF2E9] border border-[#E8D9C8] mb-3">
                          <img 
                            src={cat.imageUrl || '/category-kurtas.jpg'} 
                            alt={cat.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <h4 className="font-serif text-base font-bold text-[#1C1E21]">
                          {cat.name}
                        </h4>
                        <p className="text-xs text-neutral-500 font-light mt-0.5">
                          {cat.subtitle || 'Boutique Collection'}
                        </p>
                        <span className="inline-block mt-2 text-[10.5px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF2E9] text-[#B65A37] font-semibold">
                          {itemsCount} pieces assigned
                        </span>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2 mt-3">
                        <button
                          onClick={() => {
                            setEditingCategoryId(cat.id || cat.slug);
                            setCategoryForm({
                              name: cat.name,
                              slug: cat.slug,
                              subtitle: cat.subtitle || '',
                              imageUrl: cat.imageUrl || ''
                            });
                            setIsCategoryModalOpen(true);
                          }}
                          className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete category "${cat.name}"?`)) {
                              if (deleteCategory) deleteCategory(cat.id || cat.slug);
                              showToast('Category deleted');
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 4: ORDERS
             ======================================================== */}
          {adminTab === 'orders' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              
              <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order ID, customer name, phone..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E3C]/30"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  {[
                    { id: 'all', label: `All (${orders.length})` },
                    { id: 'pending', label: `Pending (${pendingOrdersCount})` },
                    { id: 'accepted', label: `Accepted (${acceptedOrdersCount})` }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setOrderStatusFilter(filter.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        orderStatusFilter === filter.id
                          ? 'bg-[#1C1E21] text-white shadow-xs'
                          : 'bg-[#F1F5F9] text-neutral-600 hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map(order => (
                  <div 
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <div>
                        <span className="font-mono text-sm font-bold text-neutral-900 block">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {order.date}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {order.statusTitle || 'Processing'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-semibold text-neutral-900">{order.customerName}</p>
                      <p className="text-neutral-500">{order.phone}</p>
                      <p className="text-neutral-500 text-[11px]">{order.shippingAddress}</p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-[#B65A37]">
                        Total: ₹{(order.total || 0).toLocaleString('en-IN')}
                      </span>
                      <a
                        href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${order.customerName}! Thank you for your order #${order.id} with House of Taaga. We are preparing your artisanal pieces!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1] p-6 text-neutral-400 text-xs">
                    No matching orders found.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 5: ACCOUNTS
             ======================================================== */}
          {adminTab === 'accounts' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              {/* Admin Profile Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1C1E21]">
                      Store Admin Profile
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Super Administrator • House of Taaga, Pune
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Role</span>
                    <span className="font-bold text-neutral-800 text-sm">Super Admin</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Security Level</span>
                    <span className="font-bold text-emerald-700 text-sm">PBKDF2 Encrypted</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Session Status</span>
                    <span className="font-bold text-neutral-800 text-sm">Active & Verified</span>
                  </div>
                </div>
              </div>

              {/* Customer Directory */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-[#1C1E21]">
                      Customer Directory ({customerList.length})
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Customers registered from checkout and inquiries
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {customerList.length === 0 ? (
                    <div className="py-6 text-center text-neutral-400 text-xs">
                      No customer records yet. As customers order, their profiles will be compiled here automatically.
                    </div>
                  ) : (
                    customerList.map((cust, idx) => (
                      <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FAF2E9] text-[#B65A37] flex items-center justify-center font-bold">
                            {cust.name[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900">{cust.name}</h4>
                            <p className="text-neutral-500 text-[11px]">{cust.phone} • {cust.address}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-neutral-500 block text-[10px] uppercase">Orders</span>
                            <span className="font-bold text-neutral-900">{cust.ordersCount}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-neutral-500 block text-[10px] uppercase">Lifetime Spend</span>
                            <span className="font-bold text-[#B65A37]">₹{cust.totalSpent.toLocaleString('en-IN')}</span>
                          </div>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#FAF2E9] hover:bg-[#B65A37] text-[#B65A37] hover:text-white rounded-xl text-xs font-medium transition-colors"
                          >
                            Chat
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 6: BLOGS (THE TAAGA JOURNAL)
             ======================================================== */}
          {adminTab === 'blogs' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h3 className="font-bold text-base text-[#1C1E21]">
                    The Taaga Journal Articles ({blogs.length})
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Manage lookbook stories, textile craftsmanship notes, and behind-the-label editorial posts
                  </p>
                </div>
                <button
                  onClick={handleOpenAddBlog}
                  className="px-4 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Story</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {blogs.map((b) => (
                  <div 
                    key={b.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF2E9] mb-3 relative">
                        <img 
                          src={b.imageUrl} 
                          alt={b.title}
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase">
                          {b.category}
                        </span>
                      </div>

                      <h4 className="font-serif text-base font-bold text-[#1C1E21] leading-snug">
                        {b.title}
                      </h4>
                      <p className="text-xs text-neutral-500 font-light mt-1 line-clamp-2">
                        {b.subtitle}
                      </p>
                      <span className="text-[10px] text-neutral-400 block mt-2">
                        {b.readTime} • {b.date}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingBlogId(b.id);
                          setBlogForm({
                            title: b.title,
                            category: b.category,
                            subtitle: b.subtitle,
                            readTime: b.readTime,
                            imageUrl: b.imageUrl
                          });
                          setIsBlogModalOpen(true);
                        }}
                        className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete story "${b.title}"?`)) {
                            saveBlogs(blogs.filter(item => item.id !== b.id));
                            showToast('Story deleted');
                          }
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 7: AFFILIATE (AMBASSADOR & STYLIST PROGRAM)
             ======================================================== */}
          {adminTab === 'affiliate' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
                <div>
                  <h3 className="font-bold text-base text-[#1C1E21]">
                    Stylist & Creator Affiliate Program
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Track referral discount codes, orders, and partner commissions
                  </p>
                </div>
                <button
                  onClick={handleOpenAddAffiliate}
                  className="px-4 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Partner</span>
                </button>
              </div>

              {/* Affiliate Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Active Partners</span>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">{affiliates.length}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Total Referred Sales</span>
                  <div className="text-2xl font-bold text-emerald-700 mt-1">
                    ₹{affiliates.reduce((s, a) => s + a.sales, 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0]">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Commissions Accrued</span>
                  <div className="text-2xl font-bold text-[#B65A37] mt-1">
                    ₹{affiliates.reduce((s, a) => s + a.commission, 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Partners Table / Cards */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-3">
                <div className="divide-y divide-neutral-100">
                  {affiliates.map((aff) => (
                    <div key={aff.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-neutral-900 text-sm">{aff.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                            {aff.status}
                          </span>
                        </div>
                        <p className="text-neutral-500 text-[11px] mt-0.5">{aff.role}</p>
                        <span className="inline-block mt-1 font-mono font-bold text-[#B65A37] bg-[#FAF2E9] px-2 py-0.5 rounded-md">
                          Code: {aff.code} ({aff.discount})
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-neutral-400 block text-[10px] uppercase">Orders</span>
                          <span className="font-bold text-neutral-900">{aff.ordersCount}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-400 block text-[10px] uppercase">Sales</span>
                          <span className="font-bold text-neutral-900">₹{aff.sales.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-400 block text-[10px] uppercase">Payout</span>
                          <span className="font-bold text-emerald-700">₹{aff.commission.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 8: STORE SETTINGS
             ======================================================== */}
          {adminTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Boutique Settings Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1C1E21]">
                      Store Details & Profile
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Boutique contact information, address, and policies
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={storeConfig.storeName || 'House of Taaga'}
                      onChange={(e) => setStoreConfig(prev => ({ ...prev, storeName: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A37]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">
                      Tagline / Brand Philosophy
                    </label>
                    <input
                      type="text"
                      value={storeConfig.tagline || 'A little tradition, a lot of love'}
                      onChange={(e) => setStoreConfig(prev => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A37]/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="text"
                        value={storeConfig.whatsappNumber || '+91 93133 06258'}
                        onChange={(e) => setStoreConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A37]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={storeConfig.supportEmail || 'care@houseoftaaga.com'}
                        onChange={(e) => setStoreConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A37]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">
                      Studio Location
                    </label>
                    <input
                      type="text"
                      value={storeConfig.location || 'House of Taaga Studio, Pune, Maharashtra, India'}
                      onChange={(e) => setStoreConfig(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B65A37]/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Store settings saved successfully!')}
                    className="w-full py-3 bg-[#B65A37] hover:bg-[#A7472B] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    Save Store Settings
                  </button>
                </div>
              </div>

              {/* Master Password Change Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#1C1E21]">
                      Admin Master Security & Password
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Update the cryptographic password used to unlock this admin panel.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  {passFeedback && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passFeedback.type === 'success' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {passFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{passFeedback.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-700 font-semibold mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full py-3 bg-[#1C1E21] hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isChangingPass ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Update Admin Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================================
          MOBILE SLIDE-OVER NAVIGATION DRAWER
         ======================================================== */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
          />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo-transparent.png" 
                    alt="House of Taaga" 
                    className="h-8 w-auto object-contain" 
                  />
                  <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                    Admin
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <nav className="space-y-1">
                {navTabs.map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = adminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAdminTab(tab.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-all rounded-xl ${
                        isActive
                          ? 'bg-[#EAF4ED] text-[#1B5E3C] font-semibold'
                          : 'text-[#4A5568] hover:bg-neutral-100 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-[#1B5E3C]' : 'text-[#4A5568]'}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-[#B65A37] text-white rounded-xl text-xs font-semibold"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT PRODUCT
         ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductFormSubmit} className="space-y-4 text-xs">
              
              {/* Photo Upload Slots */}
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  Photos ({productForm.images.length}/3)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-neutral-200">
                      <img src={img} alt={`Slot ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full shadow-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {productForm.images.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputGalleryRef.current?.click()}
                      className="aspect-[3/4] rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center p-2 hover:bg-neutral-50"
                    >
                      <Plus className="w-5 h-5 text-neutral-400 mb-1" />
                      <span className="text-[10px] text-neutral-500 font-medium">Add Photo</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputGalleryRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Mustard Bandhani Zari Kurta Set"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Category</label>
                  <select
                    value={productForm.categorySlug}
                    onChange={(e) => {
                      const sel = categories.find(c => c.slug === e.target.value);
                      setProductForm(prev => ({
                        ...prev,
                        categorySlug: e.target.value,
                        category: sel ? sel.name : e.target.value
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  >
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="2890"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="3690"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Textile craft, fabric, and styling notes..."
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold"
                >
                  {editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT CATEGORY
         ======================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">
                {editingCategoryId ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kurtas"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Subtitle</label>
                <input
                  type="text"
                  value={categoryForm.subtitle}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Artisanal Everyday Silhouettes"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="/category-kurtas.jpg"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT BLOG POST
         ======================================================== */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">
                {editingBlogId ? 'Edit Story' : 'New Journal Story'}
              </h3>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. The Art of Bandhani & Golden Zari"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Category Tag</label>
                  <input
                    type="text"
                    value={blogForm.category}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="TEXTILE CRAFTSMANSHIP"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Read Time</label>
                  <input
                    type="text"
                    value={blogForm.readTime}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, readTime: e.target.value }))}
                    placeholder="3 min read"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Excerpt / Story Summary</label>
                <textarea
                  rows={3}
                  value={blogForm.subtitle}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="A short summary for the lookbook gallery card..."
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD AFFILIATE
         ======================================================== */}
      {isAffiliateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900">
                Add Stylist / Affiliate Partner
              </h3>
              <button
                onClick={() => setIsAffiliateModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAffiliateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={affiliateForm.name}
                  onChange={(e) => setAffiliateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Ananya Sen"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Role / Description</label>
                <input
                  type="text"
                  value={affiliateForm.role}
                  onChange={(e) => setAffiliateForm(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Pune Fashion Creator"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={affiliateForm.code}
                    onChange={(e) => setAffiliateForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="ANANYA10"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm uppercase font-mono font-bold text-[#B65A37]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Discount Rate</label>
                  <input
                    type="text"
                    value={affiliateForm.discount}
                    onChange={(e) => setAffiliateForm(prev => ({ ...prev, discount: e.target.value }))}
                    placeholder="10% OFF"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAffiliateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B5E3C] hover:bg-[#15472E] text-white rounded-xl text-xs font-semibold"
                >
                  Create Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
