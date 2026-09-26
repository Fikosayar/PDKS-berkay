import Alpine from 'alpinejs';
import { BasePage } from '../core/BasePage.js';
import { api } from '../core/ApiClient.js';
import { state } from '../core/StateManager.js';
import { Toast } from '../components/Toast.js';

interface LoginResponse {
  success: boolean;
  profile: { id: string; role: string; company_id: string; name: string };
}

Alpine.data('loginPage', () => ({
  taxNumber:   '' as string,
  personnelId: '' as string,
  password:    '' as string,
  loading:     false,
  showPassword: false,
  errors: { taxNumber: '', personnelId: '', password: '' } as Record<string, string>,

  validate(): boolean {
    this.errors.taxNumber   = this.taxNumber.trim()   ? '' : 'Vergi numarası zorunludur';
    this.errors.personnelId = this.personnelId.trim() ? '' : 'Personel ID zorunludur';
    this.errors.password    = this.password           ? '' : 'Şifre zorunludur';

    if (!this.errors.taxNumber && !/^\d{10,11}$/.test(this.taxNumber.trim())) {
      this.errors.taxNumber = 'Vergi numarası 10 veya 11 rakam olmalıdır';
    }

    return !this.errors.taxNumber && !this.errors.personnelId && !this.errors.password;
  },

  async submit() {
    if (!this.validate()) return;
    this.loading = true;
    try {
      const deviceId = this._getDeviceId();
      const res = await api.post<LoginResponse>('/api/v1/auth/login', {
        taxNumber:   this.taxNumber.trim(),
        personnelId: this.personnelId.trim(),
        password:    this.password,
        deviceId,
      });
      state.set('user',    { id: res.profile.id, role: res.profile.role, company_id: res.profile.company_id });
      state.set('profile', res.profile);
      (window as unknown as { router?: { navigate: (p: string) => void } }).router?.navigate('/home');
    } catch (err: unknown) {
      Toast.show(err instanceof Error ? err.message : 'Giriş başarısız', 'error');
    } finally {
      this.loading = false;
    }
  },

  _getDeviceId(): string {
    let id = localStorage.getItem('pdks_device_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('pdks_device_id', id); }
    return id;
  },
}));

export class LoginPage extends BasePage {
  async render(): Promise<void> {
    this._injectStyles();
    this.container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card card" x-data="loginPage()" x-cloak>
          <div class="login-logo">
            <div class="login-logo-icon">P</div>
            <h1 class="login-title">PDKS</h1>
            <p class="login-subtitle">Personel Devam Kontrol Sistemi</p>
          </div>

          <form @submit.prevent="submit()" novalidate>

            <!-- Vergi Numarası -->
            <div class="form-group">
              <label class="label">Vergi Numarası</label>
              <div class="input-wrapper">
                <i data-lucide="building-2" class="input-icon"></i>
                <input class="input input-icon-left" :class="errors.taxNumber ? 'error' : ''"
                  type="text" inputmode="numeric" x-model="taxNumber"
                  placeholder="Vergi / TC kimlik numarası"
                  autocomplete="organization"
                  maxlength="11" />
              </div>
              <span class="field-error" x-show="errors.taxNumber" x-text="errors.taxNumber"></span>
            </div>

            <!-- Personel ID -->
            <div class="form-group">
              <label class="label">Personel ID</label>
              <div class="input-wrapper">
                <i data-lucide="user" class="input-icon"></i>
                <input class="input input-icon-left" :class="errors.personnelId ? 'error' : ''"
                  type="text" x-model="personnelId"
                  placeholder="Personel ID giriniz"
                  autocomplete="username" autocapitalize="none" />
              </div>
              <span class="field-error" x-show="errors.personnelId" x-text="errors.personnelId"></span>
            </div>

            <!-- Şifre -->
            <div class="form-group">
              <label class="label">Şifre</label>
              <div class="input-wrapper">
                <i data-lucide="lock" class="input-icon"></i>
                <input class="input input-icon-left input-icon-right"
                  :class="errors.password ? 'error' : ''"
                  :type="showPassword ? 'text' : 'password'"
                  x-model="password"
                  placeholder="Şifrenizi giriniz"
                  autocomplete="current-password" />
                <button type="button" class="input-icon-right-btn"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'">
                  <i :data-lucide="showPassword ? 'eye-off' : 'eye'" class="icon icon-sm"></i>
                </button>
              </div>
              <span class="field-error" x-show="errors.password" x-text="errors.password"></span>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
              <i data-lucide="log-in" class="icon icon-sm" x-show="!loading"></i>
              <span x-text="loading ? 'Giriş yapılıyor...' : 'Giriş Yap'">Giriş Yap</span>
            </button>

          </form>
        </div>
      </div>`;

    // Lucide ikonlarını render et
    if ((window as unknown as { lucide?: { createIcons: () => void } }).lucide) {
      (window as unknown as { lucide: { createIcons: () => void } }).lucide.createIcons();
    }
  }

  private _injectStyles() {
    if (document.getElementById('login-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'login-page-styles';
    s.textContent = `
      .login-wrapper { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:var(--space-4); }
      .login-card { width:100%; max-width:400px; padding:var(--space-8); }
      .login-logo { text-align:center; margin-bottom:var(--space-8); }
      .login-logo-icon { width:60px; height:60px; background:var(--color-primary); border-radius:var(--radius-lg); display:inline-flex; align-items:center; justify-content:center; font-size:30px; font-weight:900; color:#fff; margin-bottom:var(--space-3); }
      .login-title { font-size:var(--font-size-xl); font-weight:800; letter-spacing:2px; margin-bottom:var(--space-1); }
      .login-subtitle { font-size:var(--font-size-sm); color:var(--color-muted); }
      .input-wrapper { position:relative; }
      .input-icon { position:absolute; left:var(--space-3); top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--color-muted); pointer-events:none; }
      .input-icon-left { padding-left:calc(var(--space-3) * 2 + 16px); }
      .input-icon-right { padding-right:calc(var(--space-3) * 2 + 16px); }
      .input-icon-right-btn { position:absolute; right:var(--space-3); top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--color-muted); display:flex; align-items:center; padding:2px; }
      .input-icon-right-btn:hover { color:var(--color-text); }
    `;
    document.head.appendChild(s);
  }
}
