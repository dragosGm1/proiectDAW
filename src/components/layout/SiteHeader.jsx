import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ST from '../../styles/styles';
import { categoryShortcuts, matchesSearchQuery } from '../../data/catalog';
import { getUser, logout } from '../../services/api';
import './SiteHeader.css';

function HeaderMenu({ cartCount, isDarkMode, products }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = getUser();

  const handleNavigation = (path, state = {}) => {
    navigate(path, state);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  // Stil comun pentru toate butoanele din meniul dropdown cu gradient mov
  const dropdownBtnStyle = {
    background: 'linear-gradient(135deg, #7928ca, #b828ff)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 15px',
    fontSize: 14,
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%'
  };

  return (
    <div className="header-menu" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={{
          background: 'linear-gradient(135deg, #7928ca, #b828ff)',
          color: '#ffffff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer',
          minWidth: '150px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰ Meniu
      </button>
      {isMenuOpen && (
        <div
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            marginTop: 10, display: 'flex',
            backgroundColor: isDarkMode ? 'rgba(34,34,34,0.95)' : 'rgba(255,255,255,0.95)',
            flexDirection: 'column', gap: 10, padding: 15,
            borderRadius: 8, boxShadow: '0px 8px 16px rgba(0,0,0,0.5)',
            zIndex: 1000, minWidth: 180,
          }}
        >
          {user ? (
            <>
              <div style={{ fontSize: 12, color: '#888', padding: '4px 0', borderBottom: '1px solid #333', marginBottom: 4 }}>
                {user.name} · <span style={{ color: '#b828ff' }}>{user.role === 'manager' ? 'Manager' : user.role === 'employee' ? `${user.level}` : 'Client'}</span>
              </div>
              {(user.role === 'manager' || user.role === 'employee') && (
                <button style={dropdownBtnStyle} onClick={() => handleNavigation('/adminpanel')}>
                  ⚙️ Admin Panel
                </button>
              )}
              <button style={dropdownBtnStyle} onClick={() => handleNavigation('/cart')}>
                🛒 Cos {cartCount > 0 && `(${cartCount})`}
              </button>
              <button style={dropdownBtnStyle} onClick={() => handleNavigation('/service', { state: { isDarkMode } })}>
                🔧 Service
              </button>
              <button style={dropdownBtnStyle} onClick={handleLogout}>
                Deconectare
              </button>
            </>
          ) : (
            <>
              <button style={dropdownBtnStyle} onClick={() => handleNavigation('/login')}>
                Log in
              </button>
              <button style={dropdownBtnStyle} onClick={() => handleNavigation('/register')}>
                Register
              </button>
              <button style={dropdownBtnStyle} onClick={() => handleNavigation('/cart')}>
                🛒 Cos {cartCount > 0 && `(${cartCount})`}
              </button>
              <button style={dropdownBtnStyle} onClick={() => handleNavigation('/service', { state: { isDarkMode } })}>
                🔧 Service
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StoreNavBar({ sortType, setSortType, showSort, products }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm,  setSearchTerm]  = useState(() => searchParams.get('q') || '');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { setSearchTerm(searchParams.get('q') || ''); }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = (products || []).filter(p => matchesSearchQuery(p, searchTerm));

  const applyPageSearch = () => {
    const query = searchTerm.trim();
    setShowResults(false);
    if (location.pathname === '/') {
      query ? setSearchParams({ q: query }) : setSearchParams({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (query) {
      navigate(`/?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  const handleSearchKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPageSearch(); } };

  const handleSearchProductClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
    setSearchTerm('');
    setShowResults(false);
  };

  const goToCategory = (sectionId) => {
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${sectionId}`);
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <nav 
      className="shortcuts-bar" 
      aria-label="Navigare magazin"
      style={{ 
        background: 'linear-gradient(135deg, #7928ca, #b828ff)',
        border: 'none' 
      }}
    >
      <div className="shortcut-links">
        {categoryShortcuts.map(shortcut => (
          <button 
            key={shortcut.id} 
            type="button" 
            className="shortcut-link" 
            onClick={() => goToCategory(shortcut.id)}
            style={{ backgroundColor: 'transparent', border: 'none' }}
          >
            <span style={{ 
              color: '#000000',
              fontWeight: 'bold'
            }}>
              {shortcut.name}
            </span>
          </button>
        ))}
      </div>

      <div className="search-container" ref={searchRef}>
        <input
          type="text"
          className="product-search-input"
          placeholder="Caută produse..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setShowResults(true); }}
          onKeyDown={handleSearchKeyDown}
        />
        {searchTerm && showResults && (
          <div className="search-results">
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 8).map(product => (
                <div key={product.id} className="search-result-item" onClick={() => handleSearchProductClick(product)}>
                  <img src={product.image} alt={product.name} className="search-result-img"
                    onError={e => { e.target.src = 'https://via.placeholder.com/50?text=Img'; }} />
                  <div>
                    <div className="search-result-title">{product.name}</div>
                    <div className="search-result-price">{Number(product.price).toFixed(2).replace('.', ',')} RON</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-no-results">Nu s-au găsit produse.</div>
            )}
          </div>
        )}
      </div>

      {showSort && (
        <div className="sort-container">
          <label htmlFor="sort-dropdown" className="sort-label" style={{ color: '#000000', fontWeight: 'bold' }}>Sortează:</label>
          <select 
            id="sort-dropdown" 
            className="sort-dropdown" 
            value={sortType} 
            onChange={e => setSortType(e.target.value)}
            style={{ color: '#7928ca', fontWeight: 'bold' }}
          >
            <option value="default">Implicit</option>
            <option value="alpha-asc">Alfabetic (A-Z)</option>
            <option value="price-asc">Preț: Crescător</option>
            <option value="price-desc">Preț: Descrescător</option>
          </select>
        </div>
      )}
    </nav>
  );
}

function SiteHeader({ isDarkMode, onToggleTheme, fontFamily, onFontChange, cartCount, sortType, setSortType, showBackButton = false, products = [] }) {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div 
        className="header-bar" 
        style={{ 
          backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8', 
          borderBottom: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px'
        }}
      >
        <div className="header-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {showBackButton && (
            <button type="button" className="back-btn" onClick={() => navigate('/')}>← Înapoi</button>
          )}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Comută la modul luminos' : 'Comută la modul întunecat'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <select className="font-dropdown" value={fontFamily} onChange={onFontChange} title="Alege fontul">
            <option value="Arial, sans-serif">Arial (Default)</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Poppins', sans-serif">Poppins</option>
          </select>
        </div>

        <button 
          type="button" 
          className="site-header-logo" 
          style={{ 
            background: 'none',
            border: 'none',
            fontSize: '36px',
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : '#000000',
            cursor: 'pointer',
            padding: 0
          }} 
          onClick={() => navigate('/')}
        >
          Gaming for All
        </button>

        <HeaderMenu cartCount={cartCount} isDarkMode={isDarkMode} products={products} />
      </div>

      <StoreNavBar
        sortType={sortType}
        setSortType={setSortType}
        showSort={typeof setSortType === 'function'}
        products={products}
      />
    </header>
  );
}

export default SiteHeader;