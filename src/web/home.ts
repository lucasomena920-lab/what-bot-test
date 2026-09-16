export const homePage = String.raw`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#075e54">
  <title>WhatsApp Bot</title>

  <style>
    :root {
      color-scheme: light;
      --primary: #075e54;
      --primary-light: #128c7e;
      --primary-soft: #e8f5f1;
      --background: #f4f7f6;
      --surface: #ffffff;
      --border: #e1e8e5;
      --text: #17221e;
      --muted: #718078;
      --success: #087443;
      --danger: #b42318;
      --warning: #9a6700;
      --shadow: 0 12px 40px rgba(15, 45, 35, .08);
      --radius: 16px;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
    }

    body {
      min-height: 100vh;
      background: var(--background);
      color: var(--text);
      font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    button,
    input {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    .hidden {
      display: none !important;
    }

    /* =========================================================
       LOGIN
       ========================================================= */

    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 18px;
      background:
        radial-gradient(circle at top left, rgba(18, 140, 126, .10), transparent 35%),
        radial-gradient(circle at bottom right, rgba(7, 94, 84, .08), transparent 35%),
        var(--background);
    }

    .auth-card {
      width: min(100%, 440px);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 22px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .auth-header {
      padding: 34px;
      background: linear-gradient(135deg, #075e54, #128c7e);
      color: white;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: rgba(255,255,255,.15);
      font-size: 25px;
    }

    .brand-title {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
    }

    .brand-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: #d7f5e7;
    }

    .auth-body {
      padding: 32px;
    }

    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      padding: 4px;
      margin-bottom: 28px;
      background: #f0f4f2;
      border-radius: 11px;
    }

    .tab {
      border: 0;
      border-radius: 8px;
      padding: 11px;
      background: transparent;
      color: var(--muted);
      font-weight: 700;
    }

    .tab.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }

    .panel {
      display: none;
    }

    .panel.active {
      display: block;
    }

    .panel h2 {
      margin: 0 0 7px;
      font-size: 23px;
    }

    .panel-description {
      margin: 0 0 24px;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
    }

    .field {
      display: grid;
      gap: 7px;
      margin-bottom: 17px;
    }

    .field label {
      font-size: 13px;
      font-weight: 750;
    }

    .field input {
      width: 100%;
      border: 1px solid #c9d6d0;
      border-radius: 10px;
      padding: 12px 13px;
      background: white;
      color: var(--text);
      outline: none;
      transition: .15s ease;
    }

    .field input:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 4px rgba(18,140,126,.10);
    }

    .field-hint {
      color: var(--muted);
      font-size: 12px;
    }

    .primary-button {
      width: 100%;
      border: 0;
      border-radius: 10px;
      padding: 13px 16px;
      background: var(--primary-light);
      color: white;
      font-weight: 800;
      transition: .15s ease;
    }

    .primary-button:hover {
      background: var(--primary);
      transform: translateY(-1px);
    }

    .notice {
      min-height: 22px;
      margin: 0 0 17px;
      font-size: 13px;
      font-weight: 700;
    }

    .notice.ok {
      color: var(--success);
    }

    .notice.error {
      color: var(--danger);
    }

    /* =========================================================
       DASHBOARD
       ========================================================= */

    .app {
      min-height: 100vh;
      display: flex;
    }

    .sidebar {
      width: 250px;
      flex-shrink: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #063f39;
      color: white;
      padding: 22px 15px;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 5px 10px 26px;
    }

    .sidebar-brand-icon {
      width: 39px;
      height: 39px;
      display: grid;
      place-items: center;
      border-radius: 11px;
      background: rgba(255,255,255,.12);
    }

    .sidebar-brand strong {
      font-size: 17px;
    }

    .sidebar-brand span {
      display: block;
      margin-top: 2px;
      font-size: 11px;
      color: #a9d7ca;
    }

    .nav-title {
      padding: 0 10px;
      margin: 8px 0 8px;
      color: #79b9ab;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }

    .nav-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 11px;
      border: 0;
      border-radius: 9px;
      margin-bottom: 4px;
      padding: 11px 12px;
      background: transparent;
      color: #d2ebe4;
      text-align: left;
      font-size: 14px;
      font-weight: 650;
    }

    .nav-item.active,
    .nav-item:hover {
      background: rgba(255,255,255,.10);
      color: white;
    }

    .nav-icon {
      width: 20px;
      text-align: center;
    }

    .sidebar-bottom {
      margin-top: auto;
      padding-top: 20px;
    }

    .user-box {
      padding: 12px;
      margin-bottom: 9px;
      border: 1px solid rgba(255,255,255,.09);
      border-radius: 11px;
      background: rgba(255,255,255,.05);
    }

    .user-label {
      color: #85bdb1;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 800;
    }

    .user-name {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 750;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .logout-button {
      width: 100%;
      border: 1px solid rgba(255,255,255,.10);
      border-radius: 9px;
      padding: 10px;
      background: transparent;
      color: #d2ebe4;
      font-weight: 700;
    }

    .logout-button:hover {
      background: rgba(255,255,255,.08);
      color: white;
    }

    .main {
      flex: 1;
      min-width: 0;
      padding: 30px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 28px;
    }

    .page-title h1 {
      margin: 0;
      font-size: 27px;
      letter-spacing: -.02em;
    }

    .page-title p {
      margin: 5px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .connection-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: white;
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 750;
    }

    .connection-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #98a59f;
    }

    .connection-dot.online {
      background: #16a66a;
      box-shadow: 0 0 0 4px rgba(22,166,106,.10);
    }

    .connection-dot.warning {
      background: #d69200;
    }

    .connection-dot.error {
      background: #c92b20;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      padding: 19px;
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 4px 15px rgba(15,45,35,.035);
    }

    .stat-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .stat-icon {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 9px;
      background: var(--primary-soft);
      color: var(--primary);
    }

    .stat-value {
      margin-top: 13px;
      font-size: 21px;
      font-weight: 800;
    }

    .content-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
      gap: 20px;
    }

    .card {
      background: white;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 4px 15px rgba(15,45,35,.035);
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      padding: 20px;
      border-bottom: 1px solid var(--border);
    }

    .card-header h2 {
      margin: 0;
      font-size: 16px;
    }

    .card-header p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 12px;
    }

    .card-body {
      padding: 20px;
    }

    .whatsapp-preview {
      min-height: 250px;
      display: grid;
      place-items: center;
      text-align: center;
      padding: 25px;
      background:
        radial-gradient(circle at 20% 20%, rgba(18,140,126,.05), transparent 25%),
        #f8faf9;
      border-radius: 12px;
    }

    .whatsapp-icon {
      width: 72px;
      height: 72px;
      display: grid;
      place-items: center;
      margin: 0 auto 15px;
      border-radius: 50%;
      background: var(--primary-soft);
      color: var(--primary);
      font-size: 34px;
    }

    .whatsapp-preview h3 {
      margin: 0 0 7px;
      font-size: 19px;
    }

    .whatsapp-preview p {
      max-width: 390px;
      margin: 0 auto 19px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .action-row {
      display: flex;
      justify-content: center;
      gap: 9px;
      flex-wrap: wrap;
    }

    .button {
      border: 0;
      border-radius: 9px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 800;
    }

    .button.primary {
      background: var(--primary-light);
      color: white;
    }

    .button.primary:hover {
      background: var(--primary);
    }

    .button.secondary {
      background: #eaf0ed;
      color: #173027;
    }

    .button.secondary:hover {
      background: #dce7e1;
    }

    .button.danger {
      background: #fce9e7;
      color: var(--danger);
    }

    .button.danger:hover {
      background: #f9d8d4;
    }

    .qr-wrapper {
      display: none;
      margin-top: 18px;
      text-align: center;
    }

    .qr-wrapper.visible {
      display: block;
    }

    .qr {
      width: min(100%, 270px);
      display: block;
      margin: 0 auto;
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: white;
    }

    .qr-help {
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 12px;
    }

    .status-panel {
      height: 100%;
    }

    .status-list {
      display: grid;
      gap: 2px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding: 13px 0;
      border-bottom: 1px solid #edf1ef;
      font-size: 13px;
    }

    .status-row:last-child {
      border-bottom: 0;
    }

    .status-row span:first-child {
      color: var(--muted);
    }

    .status-row strong {
      text-align: right;
      word-break: break-word;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 8px;
      border-radius: 999px;
      background: #edf2ef;
      color: #53635b;
      font-size: 11px;
    }

    .status-badge.online {
      background: #e5f7ee;
      color: var(--success);
    }

    .status-badge.qr {
      background: #fff5dc;
      color: var(--warning);
    }

    .status-badge.error {
      background: #fce9e7;
      color: var(--danger);
    }

    .raw-status {
      display: none;
      margin-top: 18px;
      padding: 12px;
      background: #f4f7f5;
      border-radius: 9px;
      color: #52635a;
      font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      white-space: pre-wrap;
      overflow: auto;
    }

    .app-notice {
      margin-bottom: 17px;
    }

    .footer {
      margin-top: 22px;
      color: #89958f;
      font-size: 11px;
      text-align: right;
    }

    /* =========================================================
       ATENDIMENTOS HUMANOS
       ========================================================= */

    .human-support-section {
      display: none;
    }

    .human-support-section.active {
      display: block;
    }

    .human-support-list {
      display: grid;
      gap: 12px;
    }

    .human-support-empty {
      padding: 24px;
      border: 1px dashed #c9d6d0;
      border-radius: 12px;
      text-align: center;
      color: var(--muted);
      background: #fbfdfc;
    }

    .human-contact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
      border: 1px solid #dce6e1;
      border-radius: 12px;
      background: #fff;
    }

    .human-contact-info {
      min-width: 0;
    }

    .human-contact-number {
      display: block;
      font-weight: 700;
      color: var(--text);
      overflow-wrap: anywhere;
    }

    .human-contact-meta {
      display: block;
      margin-top: 5px;
      color: var(--muted);
      font-size: 13px;
    }

    .human-contact-actions {
      flex-shrink: 0;
    }

    @media (max-width: 700px) {
      .human-contact {
        align-items: stretch;
        flex-direction: column;
      }

      .human-contact-actions .button {
        width: 100%;
      }
    }


    /* =========================================================
       BOT CONFIG
       ========================================================= */

    .bot-config-section {
      display: none;
    }

    .bot-config-section.active {
      display: block;
    }

    .bot-config-form {
      display: grid;
      gap: 18px;
    }

    .bot-config-form textarea {
      width: 100%;
      min-height: 120px;
      border: 1px solid #c9d6d0;
      border-radius: 10px;
      padding: 12px 13px;
      background: white;
      color: var(--text);
      font: inherit;
      line-height: 1.5;
      resize: vertical;
      outline: none;
      transition: .15s ease;
    }

    .bot-config-form textarea:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 4px rgba(18,140,126,.10);
    }

    /* =========================================================
       ASSINATURA
       ========================================================= */

    .subscription-section {
      display: none;
    }

    .subscription-section.active {
      display: block;
    }

    .subscription-card {
      max-width: 980px;
    }

    .plans-heading {
      margin-top: 4px;
    }

    .plans-heading h3 {
      margin: 0 0 5px;
      font-size: 17px;
    }

    .plans-heading p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .plan-card {
      position: relative;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 14px;
      background: white;
      transition: .15s ease;
    }

    .plan-card:hover {
      border-color: #bdcec7;
      box-shadow: 0 8px 24px rgba(15,45,35,.06);
      transform: translateY(-1px);
    }

    .plan-card.current {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(18,140,126,.08);
    }

    .plan-card.premium {
      background:
        linear-gradient(180deg, rgba(18,140,126,.045), transparent 45%),
        white;
    }

    .plan-badge {
      width: fit-content;
      margin-bottom: 13px;
      padding: 5px 8px;
      border-radius: 999px;
      background: #eef3f1;
      color: #53635b;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .plan-card.current .plan-badge {
      background: var(--primary-soft);
      color: var(--primary);
    }

    .plan-name {
      margin: 0;
      font-size: 20px;
    }

    .plan-price {
      display: flex;
      align-items: baseline;
      gap: 5px;
      margin: 10px 0 17px;
    }

    .plan-price strong {
      font-size: 27px;
      letter-spacing: -.03em;
    }

    .plan-price span {
      color: var(--muted);
      font-size: 12px;
    }

    .plan-features {
      display: grid;
      gap: 10px;
      padding: 0;
      margin: 0 0 20px;
      list-style: none;
      color: #415148;
      font-size: 13px;
      line-height: 1.45;
    }

    .plan-features li {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .plan-features li::before {
      content: "✓";
      flex-shrink: 0;
      color: var(--success);
      font-weight: 900;
    }

    .plan-action {
      width: 100%;
      margin-top: auto;
    }

    .plan-action[disabled] {
      cursor: default;
      opacity: .65;
      transform: none;
    }

    .subscription-summary {
      display: grid;
      gap: 18px;
    }

    .subscription-state {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 17px;
      border: 1px solid #ead9a9;
      border-radius: 12px;
      background: #fffaf0;
    }

    .subscription-state.active {
      border-color: #bfe6d1;
      background: #f1fbf6;
    }

    .subscription-state-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: #fff1c7;
      color: var(--warning);
      font-weight: 900;
    }

    .subscription-state.active .subscription-state-icon {
      background: #daf4e7;
      color: var(--success);
    }

    .subscription-state h3 {
      margin: 0 0 5px;
      font-size: 16px;
    }

    .subscription-state p {
      margin: 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.55;
    }

    .subscription-details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .subscription-detail {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fbfdfc;
    }

    .subscription-detail span {
      display: block;
      margin-bottom: 5px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .subscription-detail strong {
      font-size: 14px;
      overflow-wrap: anywhere;
    }

    .subscription-actions {
      display: flex;
      gap: 9px;
      flex-wrap: wrap;
    }

    .nav-item.locked {
      opacity: .52;
      cursor: not-allowed;
    }

    .nav-item.locked:hover {
      background: transparent;
      color: #d2ebe4;
    }

    @media (max-width: 700px) {
      .plans-grid,
      .subscription-details {
        grid-template-columns: 1fr;
      }
    }


    /* =========================================================
       RESPONSIVE
       ========================================================= */

    @media (max-width: 950px) {
      .sidebar {
        width: 210px;
      }

      .main {
        padding: 24px;
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .app {
        display: block;
      }

      .sidebar {
        width: 100%;
        min-height: auto;
        padding: 12px;
      }

      .sidebar-brand {
        padding: 5px 8px 12px;
      }

      .nav-title,
      .sidebar-bottom {
        display: none;
      }

      .nav-item {
        display: none;
      }

      .main {
        padding: 20px 15px;
      }

      .stats {
        grid-template-columns: 1fr;
      }

      .topbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .connection-pill {
        align-self: flex-start;
      }
    }

    @media (max-width: 480px) {
      .auth-page {
        padding: 0;
      }

      .auth-card {
        min-height: 100vh;
        border: 0;
        border-radius: 0;
      }

      .auth-header,
      .auth-body {
        padding: 25px 20px;
      }

      .main {
        padding: 17px 12px;
      }

      .card-header,
      .card-body {
        padding: 16px;
      }
    }
  </style>
</head>

<body>

  <!-- =========================================================
       AUTENTICAÇÃO
       ========================================================= -->

  <section class="auth-page" id="authArea">

    <div class="auth-card">

      <header class="auth-header">
        <div class="brand">
          <div class="brand-icon">◉</div>

          <div>
            <h1 class="brand-title">WhatsApp Bot</h1>
            <p class="brand-subtitle">
              Automação e gerenciamento do seu WhatsApp
            </p>
          </div>
        </div>
      </header>

      <div class="auth-body">

        <div class="tabs" aria-label="Autenticação">
          <button
            class="tab active"
            type="button"
            data-tab="login"
          >
            Entrar
          </button>

          <button
            class="tab"
            type="button"
            data-tab="register"
          >
            Criar conta
          </button>
        </div>

        <div
          id="notice"
          class="notice"
          aria-live="polite"
        ></div>

        <!-- LOGIN -->

        <form
          class="panel active"
          id="login"
          novalidate
        >

          <h2>Bem-vindo de volta</h2>

          <p class="panel-description">
            Entre na sua conta para administrar sua conexão do WhatsApp.
          </p>

          <div class="field">
            <label for="loginEmail">
              E-mail
            </label>

            <input
              id="loginEmail"
              type="email"
              autocomplete="email"
              maxlength="254"
              placeholder="seu@email.com"
              required
            >
          </div>

          <div class="field">
            <label for="loginPassword">
              Senha
            </label>

            <input
              id="loginPassword"
              type="password"
              autocomplete="current-password"
              minlength="10"
              placeholder="Sua senha"
              required
            >
          </div>

          <button
            class="primary-button"
            type="submit"
          >
            Entrar com segurança
          </button>

        </form>

        <!-- CADASTRO -->

        <form
          class="panel"
          id="register"
          novalidate
        >

          <h2>Crie sua conta</h2>

          <p class="panel-description">
            Crie sua conta para começar a utilizar o painel.
          </p>

          <div class="field">
            <label for="name">
              Nome
            </label>

            <input
              id="name"
              autocomplete="name"
              maxlength="80"
              placeholder="Seu nome"
              required
            >
          </div>

          <div class="field">
            <label for="registerEmail">
              E-mail
            </label>

            <input
              id="registerEmail"
              type="email"
              autocomplete="email"
              maxlength="254"
              placeholder="seu@email.com"
              required
            >
          </div>

          <div class="field">
            <label for="registerPassword">
              Senha
            </label>

            <input
              id="registerPassword"
              type="password"
              autocomplete="new-password"
              minlength="10"
              placeholder="Crie uma senha"
              required
            >

            <span class="field-hint">
              Use pelo menos 10 caracteres.
            </span>
          </div>

          <button
            class="primary-button"
            type="submit"
          >
            Criar minha conta
          </button>

        </form>

      </div>

    </div>

  </section>


  <!-- =========================================================
       DASHBOARD
       ========================================================= -->

  <section
    class="app hidden"
    id="dashboard"
  >

    <!-- SIDEBAR -->

    <aside class="sidebar">

      <div class="sidebar-brand">

        <div class="sidebar-brand-icon">
          ◉
        </div>

        <div>
          <strong>WhatsApp Bot</strong>
          <span>Painel de controle</span>
        </div>

      </div>

      <div class="nav-title">
        Principal
      </div>

      <button
        class="nav-item active"
        id="navOverview"
        type="button"
        data-view="overview"
      >
        <span class="nav-icon">⌂</span>
        Visão geral
      </button>

      <button
        class="nav-item"
        id="navSubscription"
        type="button"
        data-view="subscription"
      >
        <span class="nav-icon">◇</span>
        Assinatura
      </button>

      <button
        class="nav-item"
        id="navWhatsapp"
        type="button"
        data-view="whatsapp"
      >
        <span class="nav-icon">▣</span>
        WhatsApp
      </button>

      <button
        class="nav-item"
        id="navHumanSupport"
        type="button"
        data-view="human-support"
      >
        <span class="nav-icon">☏</span>
        Atendimentos
      </button>

      <button
        class="nav-item"
        id="navBotConfig"
        type="button"
        data-view="bot"
      >
        <span class="nav-icon">⚙</span>
        Configurações
      </button>

      <div class="sidebar-bottom">

        <div class="user-box">

          <div class="user-label">
            Conta
          </div>

          <div
            class="user-name"
            id="userName"
          >
            -
          </div>

        </div>

        <button
          class="logout-button"
          id="logout"
          type="button"
        >
          Sair da conta
        </button>

      </div>

    </aside>


    <!-- CONTEÚDO -->

    <main class="main">

      <header class="topbar">

        <div class="page-title">

          <h1 id="pageTitle">Visão geral</h1>

          <p id="pageSubtitle">
            Gerencie sua conexão e acompanhe o estado do seu bot.
          </p>

        </div>

        <div class="connection-pill">

          <span
            class="connection-dot"
            id="connectionDot"
          ></span>

          <span id="connectionText">
            Desconectado
          </span>

        </div>

      </header>


      <div
        id="appNotice"
        class="notice app-notice"
        aria-live="polite"
      ></div>


      <div id="overviewContent">

      <!-- ESTATÍSTICAS -->

      <section class="stats">

        <div class="stat-card">

          <div class="stat-top">

            <span class="stat-label">
              Status do WhatsApp
            </span>

            <div class="stat-icon">
              ◉
            </div>

          </div>

          <div
            class="stat-value"
            id="statStatus"
          >
            Desconectado
          </div>

        </div>


        <div class="stat-card">

          <div class="stat-top">

            <span class="stat-label">
              Número conectado
            </span>

            <div class="stat-icon">
              ☎
            </div>

          </div>

          <div
            class="stat-value"
            id="statPhone"
          >
            —
          </div>

        </div>


        <div class="stat-card">

          <div class="stat-top">

            <span class="stat-label">
              Sessão
            </span>

            <div class="stat-icon">
              ◈
            </div>

          </div>

          <div
            class="stat-value"
            id="statSession"
          >
            Não iniciada
          </div>

        </div>

      </section>

      </div>


      <section
        id="subscriptionSection"
        class="subscription-section"
      >

        <article class="card subscription-card">

          <div class="card-header">
            <div>
              <h2>Assinatura</h2>
              <p>
                Consulte seu plano atual e compare as opções disponíveis.
              </p>
            </div>
          </div>

          <div class="card-body">

            <div class="subscription-summary">

              <div
                class="subscription-state"
                id="subscriptionState"
              >
                <div class="subscription-state-icon">
                  ◇
                </div>

                <div>
                  <h3 id="subscriptionTitle">
                    Verificando assinatura
                  </h3>

                  <p id="subscriptionDescription">
                    Aguarde enquanto consultamos o acesso da sua conta.
                  </p>
                </div>
              </div>

              <div class="subscription-details">

                <div class="subscription-detail">
                  <span>Plano atual</span>
                  <strong id="subscriptionPlan">
                    —
                  </strong>
                </div>

                <div class="subscription-detail">
                  <span>Status</span>
                  <strong id="subscriptionStatus">
                    —
                  </strong>
                </div>

              </div>

              <div class="plans-heading">
                <h3>Planos disponíveis</h3>
                <p>
                  Escolha a opção que melhor atende ao uso da sua empresa.
                </p>
              </div>

              <div class="plans-grid">

                <article
                  class="plan-card"
                  id="basicPlanCard"
                >
                  <span
                    class="plan-badge"
                    id="basicPlanBadge"
                  >
                    Basic
                  </span>

                  <h3 class="plan-name">
                    Basic
                  </h3>

                  <div class="plan-price">
                    <strong>€19,90</strong>
                    <span>/ mês</span>
                  </div>

                  <ul class="plan-features">
                    <li>1 conexão de WhatsApp</li>
                    <li>Atendimento automático</li>
                    <li>Configuração das mensagens do bot</li>
                    <li>Atendimento humano por contato</li>
                    <li>Gerenciamento da sessão pelo painel</li>
                  </ul>

                  <button
                    class="button secondary plan-action"
                    id="chooseBasicPlan"
                    type="button"
                    data-plan="basic"
                  >
                    Escolher Basic
                  </button>
                </article>

                <article
                  class="plan-card premium"
                  id="premiumPlanCard"
                >
                  <span
                    class="plan-badge"
                    id="premiumPlanBadge"
                  >
                    Premium
                  </span>

                  <h3 class="plan-name">
                    Premium
                  </h3>

                  <div class="plan-price">
                    <strong>€39,90</strong>
                    <span>/ mês</span>
                  </div>

                  <ul class="plan-features">
                    <li>Tudo do plano Basic</li>
                    <li>Automações avançadas</li>
                    <li>Métricas e relatórios</li>
                    <li>Tags e organização de contatos</li>
                    <li>Follow-up automático</li>
                    <li>Integrações adicionais</li>
                  </ul>

                  <button
                    class="button primary plan-action"
                    id="choosePremiumPlan"
                    type="button"
                    data-plan="premium"
                  >
                    Escolher Premium
                  </button>
                </article>

              </div>

              <div class="subscription-actions">

                <button
                  class="button secondary"
                  id="refreshSubscription"
                  type="button"
                >
                  Atualizar status
                </button>

                <button
                  class="button primary hidden"
                  id="manageSubscription"
                  type="button"
                >
                  Gerenciar assinatura
                </button>

              </div>

              <div
                id="subscriptionNotice"
                class="notice"
                aria-live="polite"
              ></div>

            </div>

          </div>

        </article>

      </section>

      <div
        id="whatsappContent"
        class="hidden"
      >

      <!-- CONTEÚDO PRINCIPAL -->

      <section class="content-grid">

        <!-- WHATSAPP -->

        <article class="card">

          <div class="card-header">

            <div>

              <h2>
                Conexão do WhatsApp
              </h2>

              <p>
                Conecte seu WhatsApp ao sistema.
              </p>

            </div>

          </div>

          <div class="card-body">

            <div class="whatsapp-preview">

              <div>

                <div class="whatsapp-icon">
                  ◉
                </div>

                <h3 id="connectionTitle">
                  WhatsApp não conectado
                </h3>

                <p id="connectionDescription">
                  Inicie uma conexão para gerar o QR Code e vincular seu WhatsApp.
                </p>

                <div class="action-row">

                  <button
                    class="button primary"
                    id="connect"
                    type="button"
                  >
                    Conectar WhatsApp
                  </button>

                  <button
                    class="button secondary"
                    id="refresh"
                    type="button"
                  >
                    Atualizar
                  </button>

                  <button
                    class="button danger"
                    id="disconnect"
                    type="button"
                  >
                    Desconectar
                  </button>

                </div>

                <div
                  class="qr-wrapper"
                  id="qrWrapper"
                >

                  <img
                    class="qr"
                    id="qr"
                    alt="QR Code para conectar o WhatsApp"
                  >

                  <p class="qr-help">
                    Abra o WhatsApp no celular e escaneie este QR Code.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </article>


        <!-- STATUS -->

        <article class="card status-panel">

          <div class="card-header">

            <div>

              <h2>
                Estado da sessão
              </h2>

              <p>
                Informações atuais da conexão.
              </p>

            </div>

          </div>

          <div class="card-body">

            <div class="status-list">

              <div class="status-row">

                <span>
                  Estado
                </span>

                <strong>
                  <span
                    class="status-badge"
                    id="statusBadge"
                  >
                    Desconectado
                  </span>
                </strong>

              </div>

              <div class="status-row">

                <span>
                  Usuário
                </span>

                <strong id="statusUser">
                  —
                </strong>

              </div>

              <div class="status-row">

                <span>
                  Número
                </span>

                <strong id="statusPhone">
                  —
                </strong>

              </div>

              <div class="status-row">

                <span>
                  Conectado em
                </span>

                <strong id="statusConnectedAt">
                  —
                </strong>

              </div>

              <div class="status-row">

                <span>
                  Último erro
                </span>

                <strong id="statusError">
                  —
                </strong>

              </div>

            </div>

            <pre
              class="raw-status"
              id="rawStatus"
            ></pre>

          </div>

        </article>

      </section>

      </div>


      <section
        id="humanSupportSection"
        class="human-support-section"
      >

        <article class="card">

          <div class="card-header">
            <div>
              <h2>Atendimentos humanos</h2>
              <p>
                Contatos para os quais o atendimento automático está pausado.
              </p>
            </div>

            <button
              class="button secondary"
              id="refreshHumanContacts"
              type="button"
            >
              Atualizar
            </button>
          </div>

          <div class="card-body">

            <div
              id="humanSupportNotice"
              class="notice"
              aria-live="polite"
            ></div>

            <div
              id="humanSupportList"
              class="human-support-list"
            >
              <div class="human-support-empty">
                Carregando atendimentos...
              </div>
            </div>

          </div>

        </article>

      </section>


      <section
        id="botConfigSection"
        class="bot-config-section"
      >

        <article class="card">

          <div class="card-header">
            <div>
              <h2>Configuração do bot</h2>
              <p>
                Personalize as mensagens do atendimento automático.
              </p>
            </div>
          </div>

          <div class="card-body">

            <div
              id="botConfigNotice"
              class="notice"
              aria-live="polite"
            ></div>

            <form
              id="botConfigForm"
              class="bot-config-form"
            >

              <div class="field">
                <label for="botCompanyName">
                  Nome da empresa
                </label>
                <input
                  id="botCompanyName"
                  maxlength="80"
                  required
                >
                <span class="field-hint">
                  Use {empresa} nas mensagens para inserir automaticamente o nome da empresa.
                </span>
              </div>

              <div class="field">
                <label for="botGreeting">
                  Mensagem de boas-vindas
                </label>
                <textarea
                  id="botGreeting"
                  maxlength="1200"
                  required
                ></textarea>
              </div>

              <div class="field">
                <label for="botMenu">
                  Menu principal
                </label>
                <textarea
                  id="botMenu"
                  maxlength="2000"
                  required
                ></textarea>
              </div>

              <div class="field">
                <label for="botBusinessHours">
                  Horários de atendimento
                </label>
                <textarea
                  id="botBusinessHours"
                  maxlength="1600"
                  required
                ></textarea>
              </div>

              <div class="field">
                <label for="botServices">
                  Serviços
                </label>
                <textarea
                  id="botServices"
                  maxlength="2000"
                  required
                ></textarea>
              </div>

              <div class="field">
                <label for="botHumanSupport">
                  Resposta para atendente
                </label>
                <textarea
                  id="botHumanSupport"
                  maxlength="1200"
                  required
                ></textarea>
              </div>

              <div class="field">
                <label for="botFallback">
                  Resposta quando não entender
                </label>
                <textarea
                  id="botFallback"
                  maxlength="1200"
                  required
                ></textarea>
              </div>

              <button
                class="primary-button"
                type="submit"
              >
                Salvar configuração
              </button>

            </form>

          </div>

        </article>

      </section>


      <div class="footer">
        WhatsApp Bot • Painel administrativo
      </div>

    </main>

  </section>


  <!-- =========================================================
       JAVASCRIPT
       ========================================================= -->

  <script>

    let authenticated = false;
    let timer = null;

    const $ = (selector) =>
      document.querySelector(selector);

    const notice = $("#notice");
    const appNotice = $("#appNotice");
    const authArea = $("#authArea");
    const dashboard = $("#dashboard");
    const qr = $("#qr");
    const qrWrapper = $("#qrWrapper");
    const overviewContent = $("#overviewContent");
    const whatsappContent = $("#whatsappContent");
    const humanSupportSection = $("#humanSupportSection");
    const humanSupportList = $("#humanSupportList");
    const humanSupportNotice = $("#humanSupportNotice");
    const botConfigSection = $("#botConfigSection");
    const botConfigForm = $("#botConfigForm");
    const botConfigNotice = $("#botConfigNotice");
    const subscriptionSection = $("#subscriptionSection");
    const subscriptionState = $("#subscriptionState");
    const subscriptionNotice = $("#subscriptionNotice");
    const basicPlanCard = $("#basicPlanCard");
    const premiumPlanCard = $("#premiumPlanCard");
    const chooseBasicPlan = $("#chooseBasicPlan");
    const choosePremiumPlan = $("#choosePremiumPlan");
    const manageSubscription =
      $("#manageSubscription");

    let botConfigLoaded = false;
    let subscriptionAllowed = false;
    let subscriptionChecked = false;
    let subscriptionData = null;

    function showNotice(target, text, error = false) {

      target.textContent = text;

      target.className =
        "notice " +
        (error ? "error" : "ok");

    }

    function setTab(name) {

      document
        .querySelectorAll(".tab")
        .forEach((button) => {

          button.classList.toggle(
            "active",
            button.dataset.tab === name
          );

        });

      document
        .querySelectorAll(".panel")
        .forEach((panel) => {

          panel.classList.toggle(
            "active",
            panel.id === name
          );

        });

      notice.textContent = "";

    }

    async function api(url, options = {}) {

      const headers = {
        ...(options.headers || {})
      };

      if (options.body) {
        headers["Content-Type"] =
          "application/json";
      }

      const response = await fetch(
        url,
        {
          ...options,
          headers,
          credentials: "same-origin"
        }
      );

      const data =
        await response
          .json()
          .catch(() => ({
            message:
              "Resposta inválida do servidor."
          }));

      if (
        !response.ok ||
        data.success === false
      ) {
        throw new Error(
          data.message ||
          "Não foi possível concluir a operação."
        );
      }

      return data;

    }

    function formatSubscriptionStatus(status) {

      const values = {
        active: "Ativa",
        pending: "Aguardando ativação",
        past_due: "Pagamento pendente",
        canceled: "Cancelada",
        expired: "Expirada",
        invalid: "Indisponível"
      };

      return values[status] || "Aguardando ativação";

    }

    function formatPlan(plan) {

      if (!plan || plan === "none") {
        return "Nenhum plano ativo";
      }

      return String(plan)
        .charAt(0)
        .toUpperCase() +
        String(plan).slice(1);

    }

    function setPaidNavigationState(allowed) {

      [
        $("#navWhatsapp"),
        $("#navHumanSupport"),
        $("#navBotConfig")
      ].forEach((button) => {

        if (!button) {
          return;
        }

        button.classList.toggle(
          "locked",
          !allowed
        );

        button.setAttribute(
          "aria-disabled",
          allowed ? "false" : "true"
        );

        button.title =
          allowed
            ? ""
            : "Recurso disponível com assinatura ativa.";

      });

    }

    function updatePlanCards(subscription) {

      const currentPlan =
        subscription?.allowed
          ? String(
              subscription?.plan || ""
            ).toLowerCase()
          : "";

      const isBasic =
        currentPlan === "basic";

      const isPremium =
        currentPlan === "premium";

      basicPlanCard.classList.toggle(
        "current",
        isBasic
      );

      premiumPlanCard.classList.toggle(
        "current",
        isPremium
      );

      $("#basicPlanBadge").textContent =
        isBasic
          ? "Plano atual"
          : "Basic";

      $("#premiumPlanBadge").textContent =
        isPremium
          ? "Plano atual"
          : "Premium";

      chooseBasicPlan.disabled =
        isBasic;

      choosePremiumPlan.disabled =
        isPremium;

      chooseBasicPlan.textContent =
        isBasic
          ? "Plano atual"
          : isPremium
            ? "Alterar para Basic"
            : "Escolher Basic";

      choosePremiumPlan.textContent =
        isPremium
          ? "Plano atual"
          : isBasic
            ? "Fazer upgrade"
            : "Escolher Premium";

    }

    function updateSubscriptionView(subscription) {

      subscriptionData =
        subscription || null;

      subscriptionAllowed =
        Boolean(subscription?.allowed);

      subscriptionChecked = true;

      setPaidNavigationState(
        subscriptionAllowed
      );

      updatePlanCards(
        subscription
      );

      $("#subscriptionPlan").textContent =
        formatPlan(subscription?.plan);

      $("#subscriptionStatus").textContent =
        formatSubscriptionStatus(
          subscription?.status
        );

      subscriptionState.classList.toggle(
        "active",
        subscriptionAllowed
      );

      manageSubscription.classList.toggle(
        "hidden",
        !subscriptionAllowed
      );

      if (subscriptionAllowed) {

        $("#subscriptionTitle").textContent =
          "Assinatura ativa";

        $("#subscriptionDescription").textContent =
          "Sua conta está liberada para utilizar os recursos do WhatsApp Bot.";

        subscriptionNotice.textContent = "";
        subscriptionNotice.className =
          "notice";

        return;
      }

      $("#subscriptionTitle").textContent =
        "Assinatura necessária";

      const messages = {
        account_disabled:
          "Esta conta está desativada.",
        past_due:
          "Existe uma pendência na assinatura. Regularize o pagamento para liberar os recursos.",
        canceled:
          "A assinatura desta conta foi cancelada.",
        expired:
          "A assinatura expirou. Renove o acesso para continuar utilizando o bot.",
        not_started:
          "A assinatura ainda não iniciou.",
        invalid_plan:
          "Sua conta ainda não possui um plano ativo.",
        pending:
          "Sua conta foi criada, mas a assinatura ainda precisa ser ativada."
      };

      $("#subscriptionDescription").textContent =
        messages[subscription?.reason] ||
        "Ative uma assinatura para liberar o WhatsApp, os atendimentos e as configurações do bot.";

    }

    function formatStatus(status) {

      const values = {
        open: "Conectado",
        qr: "Aguardando QR Code",
        connecting: "Conectando",
        close: "Desconectado",
        error: "Erro"
      };

      return values[status] || "Não iniciado";

    }

    function updateVisualState(session) {

      const status =
        session?.status || "close";

      const text =
        formatStatus(status);

      $("#statStatus").textContent = text;

      $("#statSession").textContent =
        status === "open"
          ? "Ativa"
          : status === "qr"
            ? "Aguardando"
            : status === "connecting"
              ? "Conectando"
              : "Inativa";

      $("#statPhone").textContent =
        session?.phoneNumber || "—";

      $("#statusUser").textContent =
        session?.userId
          ? String(session.userId)
          : "—";

      $("#statusPhone").textContent =
        session?.phoneNumber || "—";

      $("#statusConnectedAt").textContent =
        session?.connectedAt
          ? new Date(
              session.connectedAt
            ).toLocaleString("pt-BR")
          : "—";

      $("#statusError").textContent =
        session?.lastError || "—";

      const badge =
        $("#statusBadge");

      badge.textContent = text;

      badge.className =
        "status-badge";

      if (status === "open") {
        badge.classList.add("online");
      }

      if (status === "qr") {
        badge.classList.add("qr");
      }

      if (status === "error") {
        badge.classList.add("error");
      }

      const dot =
        $("#connectionDot");

      dot.className =
        "connection-dot";

      if (status === "open") {
        dot.classList.add("online");
      }

      if (
        status === "qr" ||
        status === "connecting"
      ) {
        dot.classList.add("warning");
      }

      if (status === "error") {
        dot.classList.add("error");
      }

      $("#connectionText").textContent =
        text;

      if (status === "open") {

        $("#connectionTitle").textContent =
          "WhatsApp conectado";

        $("#connectionDescription").textContent =
          "Seu WhatsApp está conectado e pronto para utilizar o bot.";

      } else if (status === "qr") {

        $("#connectionTitle").textContent =
          "Escaneie o QR Code";

        $("#connectionDescription").textContent =
          "Abra o WhatsApp no celular e escaneie o código exibido abaixo.";

      } else if (status === "connecting") {

        $("#connectionTitle").textContent =
          "Conectando WhatsApp";

        $("#connectionDescription").textContent =
          "Aguarde enquanto estabelecemos a conexão.";

      } else {

        $("#connectionTitle").textContent =
          "WhatsApp não conectado";

        $("#connectionDescription").textContent =
          "Inicie uma conexão para gerar o QR Code e vincular seu WhatsApp.";

      }

    }

    function setDashboardView(view) {

      const paidViews = [
        "whatsapp",
        "human-support",
        "bot"
      ];

      if (
        subscriptionChecked &&
        !subscriptionAllowed &&
        paidViews.includes(view)
      ) {

        view = "subscription";

        showNotice(
          appNotice,
          "Ative uma assinatura para acessar este recurso.",
          true
        );

      }

      const isOverview =
        view === "overview";

      const isSubscription =
        view === "subscription";

      const isWhatsapp =
        view === "whatsapp";

      const isHumanSupport =
        view === "human-support";

      const isBotConfig =
        view === "bot";

      overviewContent.classList.toggle(
        "hidden",
        !isOverview
      );

      subscriptionSection.classList.toggle(
        "active",
        isSubscription
      );

      whatsappContent.classList.toggle(
        "hidden",
        !isWhatsapp
      );

      humanSupportSection.classList.toggle(
        "active",
        isHumanSupport
      );

      botConfigSection.classList.toggle(
        "active",
        isBotConfig
      );

      document
        .querySelectorAll(".nav-item[data-view]")
        .forEach((button) => {

          button.classList.toggle(
            "active",
            button.dataset.view === view
          );

        });

      if (isSubscription) {

        $("#pageTitle").textContent =
          "Assinatura";

        $("#pageSubtitle").textContent =
          subscriptionAllowed
            ? "Consulte seu plano atual e compare os recursos disponíveis."
            : "Escolha um plano para liberar os recursos do sistema.";

        return;
      }

      if (isWhatsapp) {

        $("#pageTitle").textContent =
          "WhatsApp";

        $("#pageSubtitle").textContent =
          "Conecte, acompanhe e gerencie a sessão do seu WhatsApp.";

        return;
      }

      if (isHumanSupport) {

        $("#pageTitle").textContent =
          "Atendimentos";

        $("#pageSubtitle").textContent =
          "Veja os contatos em atendimento humano e reative o bot quando necessário.";

        void loadHumanContacts();

        return;
      }

      if (isBotConfig) {

        $("#pageTitle").textContent =
          "Configurações";

        $("#pageSubtitle").textContent =
          "Personalize as mensagens usadas pelo seu bot.";

        void loadBotConfig();

        return;
      }

      $("#pageTitle").textContent =
        "Visão geral";

      $("#pageSubtitle").textContent =
        "Acompanhe rapidamente o estado atual do seu bot.";

    }

    function formatContactId(contactId) {

      return String(contactId || "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "");

    }

    function renderHumanContacts(contacts) {

      humanSupportList.innerHTML = "";

      if (!Array.isArray(contacts) || contacts.length === 0) {

        const empty =
          document.createElement("div");

        empty.className =
          "human-support-empty";

        empty.textContent =
          "Nenhum contato está em atendimento humano.";

        humanSupportList.appendChild(
          empty
        );

        return;
      }

      for (const contact of contacts) {

        const item =
          document.createElement("div");

        item.className =
          "human-contact";

        const info =
          document.createElement("div");

        info.className =
          "human-contact-info";

        const number =
          document.createElement("strong");

        number.className =
          "human-contact-number";

        number.textContent =
          formatContactId(
            contact.contactId
          ) || contact.contactId;

        const meta =
          document.createElement("span");

        meta.className =
          "human-contact-meta";

        meta.textContent =
          contact.updatedAt
            ? "Em atendimento desde a última atualização: " +
              new Date(
                contact.updatedAt
              ).toLocaleString("pt-BR")
            : "Atendimento humano ativo";

        info.appendChild(number);
        info.appendChild(meta);

        const actions =
          document.createElement("div");

        actions.className =
          "human-contact-actions";

        const button =
          document.createElement("button");

        button.className =
          "button primary";

        button.type =
          "button";

        button.textContent =
          "Reativar bot";

        button.addEventListener(
          "click",
          async () => {

            button.disabled = true;
            button.textContent =
              "Reativando...";

            try {

              const data =
                await api(
                  "/bot/human-contacts/" +
                    encodeURIComponent(
                      contact.contactId
                    ) +
                    "/resume",
                  {
                    method: "PUT"
                  }
                );

              showNotice(
                humanSupportNotice,
                data.message
              );

              await loadHumanContacts();

            } catch (error) {

              showNotice(
                humanSupportNotice,
                error instanceof Error
                  ? error.message
                  : "Erro ao reativar o bot.",
                true
              );

              button.disabled = false;
              button.textContent =
                "Reativar bot";

            }

          }
        );

        actions.appendChild(button);

        item.appendChild(info);
        item.appendChild(actions);

        humanSupportList.appendChild(
          item
        );

      }

    }

    async function loadHumanContacts() {

      if (!authenticated) {
        return;
      }

      humanSupportList.innerHTML =
        '<div class="human-support-empty">Carregando atendimentos...</div>';

      try {

        const data =
          await api(
            "/bot/human-contacts"
          );

        renderHumanContacts(
          data.contacts
        );

      } catch (error) {

        humanSupportList.innerHTML =
          '<div class="human-support-empty">Não foi possível carregar os atendimentos.</div>';

        showNotice(
          humanSupportNotice,
          error instanceof Error
            ? error.message
            : "Erro ao carregar os atendimentos humanos.",
          true
        );

      }

    }

    function fillBotConfig(config) {

      $("#botCompanyName").value =
        config.companyName || "";

      $("#botGreeting").value =
        config.greeting || "";

      $("#botMenu").value =
        config.menu || "";

      $("#botBusinessHours").value =
        config.businessHours || "";

      $("#botServices").value =
        config.services || "";

      $("#botHumanSupport").value =
        config.humanSupport || "";

      $("#botFallback").value =
        config.fallback || "";

    }

    async function loadBotConfig() {

      if (!authenticated || botConfigLoaded) {
        return;
      }

      try {

        const data =
          await api("/bot/config");

        fillBotConfig(data.config);

        botConfigLoaded = true;

        botConfigNotice.textContent = "";
        botConfigNotice.className = "notice";

      } catch (error) {

        showNotice(
          botConfigNotice,
          error instanceof Error
            ? error.message
            : "Erro ao carregar a configuração do bot.",
          true
        );

      }

    }

    async function refresh() {

      if (!authenticated) {
        return;
      }

      try {

        const state =
          await api(
            "/whatsapp/status"
          );

        updateSubscriptionView(
          state.subscription
        );

        const session =
          state.session;

        updateVisualState(session);

        $("#rawStatus").textContent =
          JSON.stringify(
            session,
            null,
            2
          );

        if (!subscriptionAllowed) {

          clearTimeout(timer);

          qr.removeAttribute("src");

          qrWrapper.classList.remove(
            "visible"
          );

          setDashboardView(
            "subscription"
          );

          return;
        }

        const code =
          await api(
            "/whatsapp/qr"
          );

        if (
          session?.status === "qr" &&
          code.qrCode
        ) {

          qr.src =
            code.qrCode;

          qrWrapper.classList.add(
            "visible"
          );

        } else {

          qr.removeAttribute("src");

          qrWrapper.classList.remove(
            "visible"
          );

        }

        if (
          session &&
          (
            session.status === "connecting" ||
            session.status === "qr"
          )
        ) {

          clearTimeout(timer);

          timer = setTimeout(
            refresh,
            2500
          );

        }

      } catch (error) {

        showNotice(
          appNotice,
          error instanceof Error
            ? error.message
            : "Erro ao atualizar status.",
          true
        );

      }

    }

    function resetDashboardState() {

      authenticated = false;
      botConfigLoaded = false;
      subscriptionAllowed = false;
      subscriptionChecked = false;
      subscriptionData = null;

      setPaidNavigationState(false);

      subscriptionState.classList.remove(
        "active"
      );

      manageSubscription.classList.add(
        "hidden"
      );

      manageSubscription.disabled =
        false;

      manageSubscription.textContent =
        "Gerenciar assinatura";

      $("#subscriptionPlan").textContent =
        "—";

      $("#subscriptionStatus").textContent =
        "—";

      updatePlanCards(null);

      humanSupportList.innerHTML =
        '<div class="human-support-empty">Nenhum atendimento carregado.</div>';

      humanSupportNotice.textContent = "";
      humanSupportNotice.className =
        "notice";

      subscriptionNotice.textContent = "";
      subscriptionNotice.className =
        "notice";

      clearTimeout(timer);

      qr.removeAttribute("src");

      qrWrapper.classList.remove(
        "visible"
      );

      $("#rawStatus").textContent =
        "";

    }

    async function waitForSubscriptionActivation(
      maxAttempts = 12,
      delayMs = 1500
    ) {

      for (
        let attempt = 0;
        attempt < maxAttempts;
        attempt += 1
      ) {

        try {

          const state =
            await api(
              "/whatsapp/status"
            );

          updateSubscriptionView(
            state.subscription
          );

          if (subscriptionAllowed) {
            return true;
          }

        } catch {
          // Tenta novamente enquanto o webhook
          // ainda pode estar sendo processado.
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              delayMs
            )
        );

      }

      return false;

    }


    async function restoreSession() {

      const searchParams =
        new URLSearchParams(
          window.location.search
        );

      const checkoutState =
        searchParams.get(
          "checkout"
        );

      const billingState =
        searchParams.get(
          "billing"
        );

      try {

        const data =
          await api(
            "/auth/me"
          );

        authenticated = true;

        $("#userName")
          .textContent =
          data.user.name;

        authArea.classList.add(
          "hidden"
        );

        dashboard.classList.remove(
          "hidden"
        );

        botConfigLoaded = false;
        subscriptionAllowed = false;
        subscriptionChecked = false;
        subscriptionData = null;

        setPaidNavigationState(false);

        setDashboardView(
          "overview"
        );

        await refresh();

        if (
          checkoutState === "success"
        ) {

          setDashboardView(
            "subscription"
          );

          if (subscriptionAllowed) {

            showNotice(
              subscriptionNotice,
              "Pagamento confirmado. Sua assinatura está ativa."
            );

          } else {

            showNotice(
              subscriptionNotice,
              "Pagamento concluído. Confirmando sua assinatura..."
            );

            const activated =
              await waitForSubscriptionActivation();

            if (activated) {

              showNotice(
                subscriptionNotice,
                "Pagamento confirmado. Sua assinatura está ativa."
              );

            } else {

              showNotice(
                subscriptionNotice,
                "Pagamento recebido. A confirmação está demorando um pouco mais; use Atualizar status em alguns segundos."
              );

            }

          }

        } else if (
          checkoutState === "cancel"
        ) {

          setDashboardView(
            "subscription"
          );

          showNotice(
            subscriptionNotice,
            "Pagamento cancelado. Nenhuma assinatura foi ativada.",
            true
          );

        } else if (
          billingState === "return"
        ) {

          setDashboardView(
            "subscription"
          );

          await refresh();

          showNotice(
            subscriptionNotice,
            "Dados da assinatura atualizados."
          );

        }

      } catch {

        resetDashboardState();

        dashboard.classList.add(
          "hidden"
        );

        authArea.classList.remove(
          "hidden"
        );

      } finally {

        if (
          checkoutState ||
          billingState
        ) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

      }

    }


    document
      .querySelectorAll(".tab")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () =>
            setTab(
              button.dataset.tab
            )
        );

      });

    document
      .querySelectorAll(".nav-item[data-view]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          () =>
            setDashboardView(
              button.dataset.view
            )
        );

      });


    /* =========================================================
       CADASTRO
       ========================================================= */

    $("#register")
      .addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();

          const name =
            $("#name").value.trim();

          const email =
            $("#registerEmail")
              .value
              .trim();

          const password =
            $("#registerPassword")
              .value;

          try {

            const data =
              await api(
                "/auth/register",
                {
                  method: "POST",
                  body: JSON.stringify({
                    name,
                    email,
                    password
                  })
                }
              );

            $("#loginEmail").value =
              email;

            $("#loginPassword").value =
              "";

            setTab("login");

            showNotice(
              notice,
              data.message +
              " Faça login para continuar."
            );

          } catch (error) {

            showNotice(
              notice,
              error instanceof Error
                ? error.message
                : "Erro ao criar conta.",
              true
            );

          }

        }
      );


    /* =========================================================
       LOGIN
       ========================================================= */

    $("#login")
      .addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();

          try {

            const data =
              await api(
                "/auth/login",
                {
                  method: "POST",
                  body: JSON.stringify({
                    email:
                      $("#loginEmail")
                        .value
                        .trim(),

                    password:
                      $("#loginPassword")
                        .value
                  })
                }
              );

            authenticated = true;

            $("#userName")
              .textContent =
              data.user.name;

            authArea.classList.add(
              "hidden"
            );

            dashboard.classList.remove(
              "hidden"
            );

            showNotice(
              appNotice,
              "Login realizado com sucesso."
            );

            botConfigLoaded = false;
            subscriptionAllowed = false;
            subscriptionChecked = false;
            subscriptionData = null;
            setPaidNavigationState(false);
            setDashboardView("overview");

            await refresh();

          } catch (error) {

            showNotice(
              notice,
              error instanceof Error
                ? error.message
                : "Erro ao entrar.",
              true
            );

          }

        }
      );


    /* =========================================================
       ASSINATURA
       ========================================================= */

    $("#refreshSubscription")
      .addEventListener(
        "click",
        async () => {

          subscriptionNotice.textContent = "";
          subscriptionNotice.className =
            "notice";

          await refresh();

          showNotice(
            subscriptionNotice,
            subscriptionAllowed
              ? "Status da assinatura atualizado."
              : "Sua assinatura ainda não está ativa.",
            !subscriptionAllowed
          );

        }
      );

    manageSubscription
      .addEventListener(
        "click",
        async () => {

          const originalText =
            manageSubscription.textContent;

          manageSubscription.disabled =
            true;

          manageSubscription.textContent =
            "Abrindo gerenciamento...";

          subscriptionNotice.textContent =
            "";

          subscriptionNotice.className =
            "notice";

          try {

            const data =
              await api(
                "/subscription/portal",
                {
                  method: "POST"
                }
              );

            if (
              typeof data.portalUrl !== "string" ||
              !data.portalUrl
            ) {
              throw new Error(
                "A página de gerenciamento não foi retornada."
              );
            }

            showNotice(
              subscriptionNotice,
              "Redirecionando para o gerenciamento da assinatura..."
            );

            window.location.assign(
              data.portalUrl
            );

          } catch (error) {

            showNotice(
              subscriptionNotice,
              error instanceof Error
                ? error.message
                : "Não foi possível abrir o gerenciamento da assinatura.",
              true
            );

            manageSubscription.disabled =
              false;

            manageSubscription.textContent =
              originalText;

          }

        }
      );

    document
      .querySelectorAll("[data-plan]")
      .forEach((button) => {

        button.addEventListener(
          "click",
          async () => {

            const plan =
              button.dataset.plan === "premium"
                ? "premium"
                : "basic";

            const selectedPlan =
              plan === "premium"
                ? "Premium"
                : "Basic";

            const originalText =
              button.textContent;

            button.disabled = true;

            button.textContent =
              "Abrindo pagamento...";

            subscriptionNotice.textContent = "";
            subscriptionNotice.className =
              "notice";

            try {

              const data =
                await api(
                  "/subscription/checkout",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      plan
                    })
                  }
                );

              if (
                typeof data.checkoutUrl !== "string" ||
                !data.checkoutUrl
              ) {
                throw new Error(
                  "A página de pagamento não foi retornada."
                );
              }

              showNotice(
                subscriptionNotice,
                "Redirecionando para o pagamento do plano " +
                  selectedPlan +
                  "..."
              );

              window.location.assign(
                data.checkoutUrl
              );

            } catch (error) {

              showNotice(
                subscriptionNotice,
                error instanceof Error
                  ? error.message
                  : "Não foi possível iniciar o pagamento do plano " +
                    selectedPlan +
                    ".",
                true
              );

              button.disabled = false;
              button.textContent =
                originalText;

            }

          }
        );

      });


    /* =========================================================
       ATENDIMENTOS HUMANOS
       ========================================================= */

    $("#refreshHumanContacts")
      .addEventListener(
        "click",
        async () => {

          humanSupportNotice.textContent = "";
          humanSupportNotice.className =
            "notice";

          await loadHumanContacts();

        }
      );


    /* =========================================================
       CONFIGURAÇÃO DO BOT
       ========================================================= */

    botConfigForm
      .addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();

          const config = {
            companyName:
              $("#botCompanyName").value.trim(),

            greeting:
              $("#botGreeting").value.trim(),

            menu:
              $("#botMenu").value.trim(),

            businessHours:
              $("#botBusinessHours").value.trim(),

            services:
              $("#botServices").value.trim(),

            humanSupport:
              $("#botHumanSupport").value.trim(),

            fallback:
              $("#botFallback").value.trim()
          };

          try {

            const data =
              await api(
                "/bot/config",
                {
                  method: "PUT",
                  body: JSON.stringify(config)
                }
              );

            fillBotConfig(data.config);
            botConfigLoaded = true;

            showNotice(
              botConfigNotice,
              data.message
            );

          } catch (error) {

            showNotice(
              botConfigNotice,
              error instanceof Error
                ? error.message
                : "Erro ao salvar a configuração do bot.",
              true
            );

          }

        }
      );


    /* =========================================================
       CONECTAR WHATSAPP
       ========================================================= */

    $("#connect")
      .addEventListener(
        "click",
        async () => {

          try {

            showNotice(
              appNotice,
              "Iniciando conexão..."
            );

            const data =
              await api(
                "/whatsapp/connect",
                {
                  method: "POST"
                }
              );

            showNotice(
              appNotice,
              data.message
            );

            await refresh();

          } catch (error) {

            showNotice(
              appNotice,
              error instanceof Error
                ? error.message
                : "Erro ao conectar.",
              true
            );

          }

        }
      );


    /* =========================================================
       ATUALIZAR
       ========================================================= */

    $("#refresh")
      .addEventListener(
        "click",
        async () => {

          showNotice(
            appNotice,
            "Atualizando status..."
          );

          await refresh();

        }
      );


    /* =========================================================
       DESCONECTAR
       ========================================================= */

    $("#disconnect")
      .addEventListener(
        "click",
        async () => {

          try {

            const data =
              await api(
                "/whatsapp/disconnect",
                {
                  method: "POST"
                }
              );

            clearTimeout(timer);

            qr.removeAttribute("src");

            qrWrapper.classList.remove(
              "visible"
            );

            updateVisualState(null);

            showNotice(
              appNotice,
              data.message
            );

          } catch (error) {

            showNotice(
              appNotice,
              error instanceof Error
                ? error.message
                : "Erro ao desconectar.",
              true
            );

          }

        }
      );


    /* =========================================================
       LOGOUT
       ========================================================= */

    $("#logout")
      .addEventListener(
        "click",
        async () => {

          try {

            await api(
              "/auth/logout",
              {
                method: "POST"
              }
            );

          } catch {
            // Mesmo se a chamada falhar, encerramos
            // o estado local da interface.
          }

          resetDashboardState();

          dashboard.classList.add(
            "hidden"
          );

          authArea.classList.remove(
            "hidden"
          );

          $("#loginPassword").value =
            "";

          showNotice(
            notice,
            "Sessão encerrada."
          );

        }
      );

    void restoreSession();

  </script>

</body>
</html>`;
