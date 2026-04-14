import React from "react";

const Sidebar = ({ currentPage, onNavigate, items }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TradingBot Admin</h2>
        <span>Django Administration</span>
      </div>
      {items.map((section) => (
        <div className="sidebar-section" key={section.section}>
          <div className="sidebar-section-label">{section.section}</div>
          {section.items.map((item) => (
            <div
              key={item.label}
              className={`sidebar-item ${currentPage === item.page ? "active" : ""}`}
              onClick={() => item.page && onNavigate(item.page)}
              style={{
                opacity: item.page ? 1 : 0.45,
                cursor: item.page ? "pointer" : "default",
              }}
            >
              <span className={`dot dot-${item.dot}`} />
              {item.label}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
