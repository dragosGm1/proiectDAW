import React, { useState, useCallback, useEffect } from 'react';
import './HomePage.css';
import ST from '../styles/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/cart';
import SiteHeader from '../components/layout/SiteHeader';
import { matchesSearchQuery } from '../data/catalog';
import { api, getUser } from '../services/api';

const SECTIONS = [
  { id: 'section-jocuri-ps', title: 'Jocuri PS', slug: 'sisteme' },
  { id: 'section-procesoare', title: 'Procesoare', slug: 'procesoare' },
  { id: 'section-placi-video', title: 'Plăci Video', slug: 'placi-video' },
  { id: 'section-placi-baza', title: 'Plăci De Bază', slug: 'placi-baza' },
];

// Jocurile PS definite ca înlocuitor direct pentru sloturile de sisteme
const PS_GAMES = [
  { 
    id: 'ps-game-1',
    categorySlug: 'sisteme',
    name: "Marvel's Spider-Man (PS4)", 
    price: 199.99, 
    installments: 50,
    rating: 5,
    stock: 10,
    image: "https://s13emagst.akamaized.net/products/13349/13348578/images/res_afdc48d63bb971b6f8f7809a233a3420.jpg?width=720&height=720&hash=E73824603E9E966C4EFE36D9852B672E"
  },
  { 
    id: 'ps-game-2',
    categorySlug: 'sisteme',
    name: "Naruto Shippuden: Ultimate Ninja Storm 4 (PS4)", 
    price: 149.99, 
    installments: 37.5,
    rating: 5,
    stock: 8,
    image: "https://cdn.usedproducts.ro/products/a512b8cc-8621-476a-b58d-ca1298887989/main.jpg"
  },
  { 
    id: 'ps-game-3',
    categorySlug: 'sisteme',
    name: "Red Dead Redemption II (PS4)", 
    price: 249.99, 
    installments: 62.5,
    rating: 5,
    stock: 15,
    image: "https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg"
  },
  { 
    id: 'ps-game-4',
    categorySlug: 'sisteme',
    name: "Grand Theft Auto V (PS5)", 
    price: 179.99, 
    installments: 45,
    rating: 5,
    stock: 12,
    image: "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png"
  },
  { 
    id: 'ps-game-5',
    categorySlug: 'sisteme',
    name: "Demon Slayer: Kimetsu no Yaiba (PS4)", 
    price: 229.99, 
    installments: 57.5,
    rating: 4,
    stock: 6,
    image: "https://s13emagst.akamaized.net/products/41139/41138833/images/res_1b4ea6bd33ba4248bcfee00685ff63a4.png?width=720&height=720&hash=CE3AB95BCB8590F46CAB57FB2847CF5F"
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageQuery = searchParams.get('q') || '';

  const [products,    setProducts]    = useState([]);
  const [promotions,  setPromotions]  = useState([]);
  const [loadingProds,setLoadingProds]= useState(true);
  const [notification,setNotification]= useState(null);
  const [sortType,    setSortType]    = useState('default');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('pc-garage-theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('pc-garage-font') || 'Arial, sans-serif');

  useEffect(() => {
    Promise.all([api('/products'), api('/promotions/active')])
      .then(([prods, promos]) => { 
        // 1. Ștergem doar sistemele vechi (cele cu categorySlug === 'sisteme' venite de la server)
        const nonSystemProducts = prods.filter(p => p.categorySlug !== 'sisteme');
        
        // 2. Păstrăm tot restul (procesoare, plăci video, etc.) și adăugăm jocurile noastre PS
        setProducts([...PS_GAMES, ...nonSystemProducts]); 
        setPromotions(promos); 
      })
      .catch(() => {})
      .finally(() => setLoadingProds(false));
  }, []);

  useEffect(() => {
    const sectionId = window.location.hash.replace('#', '');
    if (!sectionId) return;
    requestAnimationFrame(() => { document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }); });
  }, []);

  const notify = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const { cartCount, addToCart } = useCart(notify, null);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('pc-garage-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleFontChange = (e) => {
    const newFont = e.target.value;
    setFontFamily(newFont);
    localStorage.setItem('pc-garage-font', newFont);
  };

  const sortProducts = (prods, type) => {
    const arr = [...prods];
    switch (type) {
      case 'price-asc':  return arr.sort((a, b) => a.price - b.price);
      case 'price-desc': return arr.sort((a, b) => b.price - a.price);
      case 'alpha-asc':  return arr.sort((a, b) => a.name.localeCompare(b.name));
      default: return arr;
    }
  };

  const clearPageSearch = () => setSearchParams({});

  const visibleSections = SECTIONS.map(section => ({
    ...section,
    products: sortProducts(
      products.filter(p => p.categorySlug === section.slug && matchesSearchQuery(p, pageQuery)),
      sortType
    ),
  })).filter(s => s.products.length > 0 || !pageQuery);

  const totalVisible = visibleSections.reduce((sum, s) => sum + s.products.length, 0);

  const promoForProduct = (productId) =>
    promotions.find(p => p.productId === productId) || null;

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const user = getUser();
    if (!user) { notify('Trebuie sa te autentifici pentru a comanda.', 'error'); navigate('/login'); return; }
    addToCart(product, promoForProduct(product.id), user);
  };

  const renderProduct = (product) => {
    const promo = promoForProduct(product.id);
    const discountedPrice = promo
      ? Number(product.price) * (1 - (promo.discountPercent || 10) / 100)
      : null;

    return (
      <div key={product.id} className="product-card" style={{ position: 'relative' }}>
        {promo && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 2,
            background: 'linear-gradient(135deg, #7928ca, #b828ff)',
            color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '3px 8px', borderRadius: 4,
          }}>
            -{promo.discountPercent || 10}% PROMOTIE
          </div>
        )}
        <div
          style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          onClick={() => navigate(`/product/${product.id}`, { state: { product, promo } })}
        >
          <div className="image-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
            <img
              src={product.image}
              alt={product.name}
              className="product-img"
              style={{ maxHeight: '190px', objectFit: 'contain' }}
              onError={e => { e.target.src = 'https://via.placeholder.com/200?text=Fara+Imagine'; }}
            />
          </div>
          <div className="rating-banner">
            {Array.from({ length: Math.min(product.rating || 4, 5) }).map((_, i) => <span key={i}>⭐</span>)}
          </div>
          <div className="product-title">{product.name}</div>
          <div className="product-price">
            {promo ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#888', fontSize: 14, marginRight: 6 }}>
                  {Number(product.price).toFixed(2).replace('.', ',')}
                </span>
                <span style={{ color: '#b828ff' }}>
                  {discountedPrice.toFixed(2).replace('.', ',')} RON
                </span>
              </>
            ) : (
              <>{Number(product.price).toFixed(2).replace('.', ',')} RON</>
            )}
          </div>
          <div className="product-installments">
            4 rate fara dobanda, doar {product.installments} RON
          </div>
          {product.stock < 4 && product.stock > 0 && (
            <div style={{ fontSize: 11, color: '#f39c12', marginTop: 4 }}>Stoc limitat ({product.stock})</div>
          )}
          {product.stock === 0 && (
            <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>Stoc epuizat</div>
          )}
        </div>
        <button
          className="add-to-cart-btn"
          disabled={product.stock === 0}
          style={{
            background: product.stock === 0 ? undefined : 'linear-gradient(135deg, #7928ca, #b828ff)',
            border: 'none',
            color: '#fff',
            cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
          }}
          onClick={e => handleAddToCart(e, product)}
        >
          {product.stock === 0 ? 'Stoc epuizat' : 'Adauga in cos'}
        </button>
      </div>
    );
  };

  return (
    <div className={`home-page-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ ...ST.app, fontFamily }}>
      <SiteHeader
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        fontFamily={fontFamily}
        onFontChange={handleFontChange}
        cartCount={cartCount}
        sortType={sortType}
        setSortType={setSortType}
        products={products}
      />

      <div className="main-content">
        {pageQuery && (
          <div className="search-filter-banner" style={{ borderLeft: '4px solid #b828ff' }}>
            <span>Rezultate pentru: <strong>&quot;{pageQuery}&quot;</strong> ({totalVisible} produse)</span>
            <button type="button" className="clear-search-btn" onClick={clearPageSearch}>Șterge filtrul</button>
          </div>
        )}

        {loadingProds ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Se incarca produsele...</div>
        ) : pageQuery && totalVisible === 0 ? (
          <div className="search-no-products">
            <p>Nu s-au găsit produse pentru &quot;{pageQuery}&quot;.</p>
            <button type="button" className="clear-search-btn" onClick={clearPageSearch}>Afișează toate produsele</button>
          </div>
        ) : (
          SECTIONS.map(section => {
            const sectionProducts = sortProducts(
              products.filter(p => p.categorySlug === section.slug && matchesSearchQuery(p, pageQuery)),
              sortType
            );
            if (pageQuery && sectionProducts.length === 0) return null;
            return (
              <section key={section.id} id={section.id} className="product-section">
                <h2 style={{ borderBottom: '2px solid #7928ca', paddingBottom: '8px' }}>{section.title}</h2>
                <div className="product-grid">
                  {sectionProducts.map(renderProduct)}
                </div>
              </section>
            );
          })
        )}
      </div>

      {notification && (
        <div className={`notification-toast ${notification.type}`} style={{ background: notification.type === 'success' ? 'linear-gradient(135deg, #7928ca, #b828ff)' : undefined }}>
          {notification.msg}
        </div>
      )}

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div style={{ ...ST.footer, padding: '20px 40px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
      <div style={{ color: '#888', fontSize: 14 }}>
        &copy; {new Date().getFullYear()}{' '}
        <strong style={{
          background: 'linear-gradient(135deg, #7928ca, #b828ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '16px'
        }}>
          Gaming for All
        </strong>. Toate drepturile rezervate.
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ color: '#e0e0e0', fontSize: 14 }}>✉️ support@gamingforall.ro</span>
        <span style={{ color: '#e0e0e0', fontSize: 14 }}>📞 0123 456 789</span>
      </div>
    </div>
  );
}

export default HomePage;