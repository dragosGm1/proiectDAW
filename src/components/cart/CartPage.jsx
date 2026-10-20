import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ST from "../../styles/styles";
import CartItem from "./CartItem";
import CheckoutModal from "./CheckoutModal";
import useCart from "./useCart";

export default function CartPage() {
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("pcg_user")); } catch { return null; }
  })();

  const [notification, setNotification] = useState(null);

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const {
    cart,
    cartTotal,
    showCheckout,
    setShowCheckout,
    loading,
    removeFromCart,
    updateQty,
    handleCheckout,
  } = useCart(notify, null);

  const onCheckout = async () => {
    const success = await handleCheckout();
    if (success) navigate("/");
  };

  // Stil comun cu gradient mov pentru butoane principale
  const purpleGradientBtnStyle = {
    background: "linear-gradient(135deg, #7928ca, #b828ff)",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  };

  return (
    <div style={ST.app}>
      {/* Notificari */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 24px",
            borderRadius: 10,
            zIndex: 999,
            fontSize: 14,
            fontWeight: 600,
            background: notification.type === "success" ? "#1a7a3a" : "#c0392b",
            color: "#fff",
          }}
        >
          {notification.type === "success" ? "✓" : "✕"} {notification.msg}
        </div>
      )}

      <div style={ST.main}>
        <h2 style={{ marginBottom: 24 }}>🛒 Cosul tau</h2>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#555" }}>
            <div style={{ fontSize: 64 }}>🛒</div>
            <p>Cosul este gol</p>
            {/* Butonul Continua cumparaturile stilizat cu mov */}
            <button 
              style={{ 
                ...ST.btn, 
                ...purpleGradientBtnStyle, 
                padding: "12px 24px", 
                fontSize: 15 
              }} 
              onClick={() => navigate("/")}
            >
              Continua cumparaturile
            </button>
          </div>
        ) : (
          <>
            {cart.map((item, idx) => (
              <CartItem
                key={`${item.id}_${idx}`}
                item={item}
                onUpdateQty={(id, delta) => updateQty(id, delta)}
                onRemove={removeFromCart}
              />
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 24,
                padding: "20px 0",
                borderTop: "2px solid #2a2a4a",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: "#888" }}>Total:</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#b828ff" }}>
                  {cartTotal.toLocaleString()} Lei
                </div>
              </div>
              {/* Butonul Finalizeaza comanda stilizat cu mov */}
              <button
                style={{ 
                  ...ST.btn, 
                  ...purpleGradientBtnStyle, 
                  padding: "14px 40px", 
                  fontSize: 16 
                }}
                onClick={() => {
                  if (!user) {
                    notify("Trebuie sa te autentifici!", "error");
                    navigate("/");
                    return;
                  }
                  setShowCheckout(true);
                }}
              >
                Finalizeaza comanda
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal confirmare comanda */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          cartTotal={cartTotal}
          user={user}
          loading={loading}
          onConfirm={onCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}