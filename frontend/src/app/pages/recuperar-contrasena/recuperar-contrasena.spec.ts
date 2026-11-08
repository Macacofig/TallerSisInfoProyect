import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { APP_CONFIG } from '../../config/app-config';
import { routes } from '../../app.routes';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { RECUPERAR_MESSAGES as M } from '../../strings/recuperar-contrasena/recuperar-contrasena.messages';
import { RECUPERAR_MESSAGES_EN as EN } from '../../strings/recuperar-contrasena/recuperar-contrasena-ingles.messages';
import { RecuperarContrasena } from './recuperar-contrasena';

describe('HU-23 Recuperar contraseña', () => {
  let fixture: ComponentFixture<RecuperarContrasena>;
  let component: RecuperarContrasena;
  let http: HttpTestingController;
  let root: HTMLElement;
  const url = `${APP_CONFIG.API.BASE_URL}${APP_CONFIG.API.ENDPOINTS.AUTH_RECUPERAR_CONTRASENA}`;
  const datos = {
    correoElectronico: 'ana@ucb.edu.bo',
    nuevaContrasena: 'NuevaClave1!',
    confirmarNuevaContrasena: 'NuevaClave1!',
  };
  const submit = () => root.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const error = () => root.querySelector('.login__error-general')?.textContent?.trim();
  function llenar(valores = datos) {
    for (const [nombre, valor] of Object.entries(valores)) {
      const input = root.querySelector<HTMLInputElement>(`#${nombre === 'correoElectronico' ? 'recuperar-correo' : nombre}`)!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
    }
    fixture.detectChanges();
  }
  function enviar() {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RecuperarContrasena],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    TestBed.inject(LanguageService).setLanguage('es');
    fixture = TestBed.createComponent(RecuperarContrasena);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('renderiza título, tres campos y acciones', () => {
    expect(root.querySelector('h1')?.textContent).toBe(M.TITLE);
    expect(root.querySelectorAll('input')).toHaveLength(3);
    expect(submit().textContent).toContain(M.SUBMIT);
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/login');
  });

  it.each([
    ['correoElectronico', '', M.REQUIRED_EMAIL],
    ['correoElectronico', 'ana@gmail.com', M.INVALID_EMAIL],
    ['correoElectronico', 'ana@@ucb.edu.bo', M.INVALID_EMAIL],
    ['nuevaContrasena', '', M.REQUIRED_PASSWORD],
    ['nuevaContrasena', 'Aa1!', M.MIN_LENGTH],
    ['nuevaContrasena', 'nuevaclave1!', M.UPPERCASE],
    ['nuevaContrasena', 'NuevaClave!', M.NUMBER],
    ['nuevaContrasena', 'NuevaClave1', M.SPECIAL],
    ['confirmarNuevaContrasena', '', M.REQUIRED_CONFIRM],
    ['confirmarNuevaContrasena', 'OtraClave1!', M.MISMATCH],
  ] as const)('valida %s = %s y bloquea el request', (campo, valor, mensaje) => {
    llenar({ ...datos, [campo]: valor });
    enviar();
    expect(component.formulario.invalid).toBe(true);
    expect(component.mensajeError(campo)).toBe(mensaje);
    expect(root.textContent).toContain(mensaje);
    http.expectNone(url);
  });

  it('valida de nuevo la coincidencia al cambiar la nueva contraseña', () => {
    llenar();
    component.formulario.controls.nuevaContrasena.setValue('OtraClave1!');
    expect(component.mensajeError('confirmarNuevaContrasena')).toBe(M.MISMATCH);
    component.formulario.controls.confirmarNuevaContrasena.setValue('OtraClave1!');
    expect(component.formulario.valid).toBe(true);
    expect(component.mensajeError('confirmarNuevaContrasena')).toBeNull();
  });

  it('acepta formulario válido y envía el contrato JSON al endpoint configurado', () => {
    const service = vi.spyOn(TestBed.inject(AuthService), 'recuperarContrasena');
    llenar({ ...datos, correoElectronico: ' ANA@UCB.EDU.BO ' });
    enviar();
    expect(component.formulario.valid).toBe(true);
    expect(service).toHaveBeenCalledExactlyOnceWith(datos);
    const request = http.expectOne({ method: 'POST', url });
    expect(request.request.body).toEqual(datos);
    expect(request.request.headers.get('Content-Type')).toBe('application/json');
    request.flush({ mensaje: 'Contraseña actualizada correctamente.' });
  });

  it('muestra loading, deshabilita botón y evita envíos duplicados', () => {
    llenar();
    enviar();
    expect(component.enviando()).toBe(true);
    expect(submit().disabled).toBe(true);
    expect(submit().textContent).toContain(M.LOADING);
    expect(root.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
    enviar();
    const request = http.expectOne(url);
    request.flush(null);
  });

  it('muestra éxito, limpia contraseñas y permite volver sin iniciar sesión', () => {
    const auth = TestBed.inject(AuthService);
    const guardar = vi.spyOn(auth, 'guardarUsuario');
    llenar();
    enviar();
    http.expectOne(url).flush(null);
    fixture.detectChanges();
    expect(component.enviando()).toBe(false);
    expect(root.querySelector('[role="status"]')?.textContent).toContain(M.SUCCESS);
    expect(root.querySelector('form')).toBeNull();
    expect(component.formulario.controls.nuevaContrasena.value).toBe('');
    expect(component.formulario.controls.confirmarNuevaContrasena.value).toBe('');
    expect(root.querySelector('a')?.getAttribute('href')).toBe('/login');
    expect(guardar).not.toHaveBeenCalled();
    component.enviar();
    http.expectNone(url);
  });

  it.each([
    [400, M.VALIDATION], [404, M.NOT_FOUND], [500, M.SERVER],
  ])('muestra error HTTP %s comprensible y permite reintentar', (estado, mensaje) => {
    llenar();
    enviar();
    http.expectOne(url).flush({ stack: 'DETALLE_TECNICO' }, { status: estado as number, statusText: 'Error' });
    fixture.detectChanges();
    expect(error()).toBe(mensaje);
    expect(root.textContent).not.toContain('DETALLE_TECNICO');
    expect(component.enviando()).toBe(false);
    expect(submit().disabled).toBe(false);
    enviar();
    http.expectOne(url).flush(null);
    fixture.detectChanges();
    expect(error()).toBeUndefined();
    expect(component.exito()).toBe(true);
  });

  it('maneja errores de red', () => {
    llenar();
    enviar();
    http.expectOne(url).error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(error()).toBe(M.CONNECTION);
    expect(submit().disabled).toBe(false);
  });

  it('muestra y oculta ambas contraseñas con controles accesibles independientes', () => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('.login__mostrar-contrasena');
    const password = root.querySelector<HTMLInputElement>('#nuevaContrasena')!;
    const confirm = root.querySelector<HTMLInputElement>('#confirmarNuevaContrasena')!;
    expect(password.type).toBe('password');
    expect(confirm.type).toBe('password');
    buttons[0].click();
    fixture.detectChanges();
    expect(password.type).toBe('text');
    expect(confirm.type).toBe('password');
    expect(buttons[0].getAttribute('aria-label')).toContain('Ocultar');
    buttons[1].click();
    fixture.detectChanges();
    expect(confirm.type).toBe('text');
    buttons[0].click();
    buttons[1].click();
    fixture.detectChanges();
    expect(password.type).toBe('password');
    expect(confirm.type).toBe('password');
  });

  it('respeta cambio de idioma para campos, validaciones y errores del servidor', () => {
    llenar();
    enviar();
    http.expectOne(url).flush(null, { status: 404, statusText: 'Not found' });
    root.querySelector<HTMLButtonElement>('.login__language-toggle')!.click();
    fixture.detectChanges();
    expect(root.querySelector('h1')?.textContent).toBe(EN.TITLE);
    expect(error()).toBe(EN.NOT_FOUND);
    llenar({ ...datos, correoElectronico: '' });
    enviar();
    expect(root.textContent).toContain(EN.REQUIRED_EMAIL);
  });

  it('cancela el request al salir de la pantalla', () => {
    llenar();
    enviar();
    const request = http.expectOne(url);
    fixture.destroy();
    expect(request.cancelled).toBe(true);
  });

  it('abre la ruta pública sin sesión y navega a login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/recuperar-contrasena', RecuperarContrasena);
    expect(APP_CONFIG.ROUTES.SIN_LAYOUT).toContain('/recuperar-contrasena');
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
  });
});
