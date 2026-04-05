// ============================================================
// INSTRUCTIONS : Crée un fichier séparé pour chaque composant
// dans frontend/src/pages/
// ============================================================

// ─── Utilisateurs.js ────────────────────────────────────────
export function Utilisateurs() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Utilisateurs</h1><p className="breadcrumb">Admin › Utilisateurs</p></div>
      <div className="empty-state">
        <div className="empty-icon">👤</div>
        <h2>Gestion des utilisateurs</h2>
        <p>Liste et gestion des comptes utilisateurs.</p>
        <span className="badge-coming">API: /api/users/</span>
      </div>
    </div>
  );
}

// ─── Groupes.js ─────────────────────────────────────────────
export function Groupes() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Groupes</h1><p className="breadcrumb">Admin › Groupes</p></div>
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h2>Gestion des groupes</h2>
        <p>Permissions et rôles des groupes d'utilisateurs.</p>
        <span className="badge-coming">API: /api/groups/</span>
      </div>
    </div>
  );
}

// ─── Trades.js ──────────────────────────────────────────────
export function Trades() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Trades</h1><p className="breadcrumb">Admin › Trading › Trades</p></div>
      <div className="empty-state">
        <div className="empty-icon">📈</div>
        <h2>Historique des trades</h2>
        <p>Tous les ordres BUY/SELL exécutés par le bot.</p>
        <span className="badge-coming">API: /api/trades/</span>
      </div>
    </div>
  );
}

// ─── PrixMarche.js ──────────────────────────────────────────
export function PrixMarche() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Prix marché</h1><p className="breadcrumb">Admin › Trading › Prix marché</p></div>
      <div className="empty-state">
        <div className="empty-icon">💲</div>
        <h2>Prix du marché en temps réel</h2>
        <p>Cours BTC, ETH et autres actifs suivis par le bot.</p>
        <span className="badge-coming">API: /api/prices/</span>
      </div>
    </div>
  );
}

// ─── Portfolios.js ──────────────────────────────────────────
export function Portfolios() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Portfolios</h1><p className="breadcrumb">Admin › Trading › Portfolios</p></div>
      <div className="empty-state">
        <div className="empty-icon">💼</div>
        <h2>Gestion des portfolios</h2>
        <p>Répartition des actifs et performance globale.</p>
        <span className="badge-coming">API: /api/portfolios/</span>
      </div>
    </div>
  );
}

// ─── Predictions.js ─────────────────────────────────────────
export function Predictions() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Prédictions IA</h1><p className="breadcrumb">Admin › IA/ML › Prédictions</p></div>
      <div className="empty-state">
        <div className="empty-icon">🧠</div>
        <h2>Prédictions du modèle IA</h2>
        <p>Signaux générés par le modèle ML pour chaque actif.</p>
        <span className="badge-coming">API: /api/predictions/</span>
      </div>
    </div>
  );
}

// ─── ModelesML.js ───────────────────────────────────────────
export function ModelesML() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Modèles ML</h1><p className="breadcrumb">Admin › IA/ML › Modèles ML</p></div>
      <div className="empty-state">
        <div className="empty-icon">⚙️</div>
        <h2>Modèles d'apprentissage</h2>
        <p>Versions, performances et déploiement des modèles ML.</p>
        <span className="badge-coming">API: /api/ml-models/</span>
      </div>
    </div>
  );
}

// ─── LogsCelery.js ──────────────────────────────────────────
export function LogsCelery() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Logs Celery</h1><p className="breadcrumb">Admin › IA/ML › Logs Celery</p></div>
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h2>Logs des tâches asynchrones</h2>
        <p>Suivi des tâches Celery : fetch prix, prédictions, trades.</p>
        <span className="badge-coming">API: /api/celery-logs/</span>
      </div>
    </div>
  );
}

// ─── LogsAudit.js ───────────────────────────────────────────
export function LogsAudit() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Logs d'audit</h1><p className="breadcrumb">Admin › Système › Logs d'audit</p></div>
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h2>Journal d'audit</h2>
        <p>Toutes les actions effectuées sur la plateforme.</p>
        <span className="badge-coming">API: /api/audit-logs/</span>
      </div>
    </div>
  );
}

// ─── Parametres.js ──────────────────────────────────────────
export function Parametres() {
  return (
    <div className="page-content">
      <div className="page-header"><h1>Paramètres</h1><p className="breadcrumb">Admin › Système › Paramètres</p></div>
      <div className="empty-state">
        <div className="empty-icon">🛠️</div>
        <h2>Configuration du système</h2>
        <p>Paramètres globaux du bot et de la plateforme.</p>
        <span className="badge-coming">API: /api/settings/</span>
      </div>
    </div>
  );
}