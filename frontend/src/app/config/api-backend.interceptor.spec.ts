import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { crearApiBackendInterceptor } from './api-backend.interceptor';

const REMOTO = 'https://backend-remoto.example.com/api';
const LOCAL = 'http://localhost:8081/api';

function configurar(hostname: string, fetchMock: ReturnType<typeof vi.fn>) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { hostname, origin: `http://${hostname}`, href: `http://${hostname}/` },
  });

  vi.stubGlobal('fetch', fetchMock);

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([crearApiBackendInterceptor(REMOTO, LOCAL)])),
      provideHttpClientTesting(),
    ],
  });

  return TestBed.inject(HttpTestingController);
}

async function esperarPeticion(
  http: HttpTestingController,
  url: string
): Promise<ReturnType<HttpTestingController['expectOne']>> {
  let peticion: ReturnType<HttpTestingController['expectOne']> | undefined;

  await vi.waitFor(() => {
    peticion = http.expectOne(url);
  });

  return peticion!;
}

describe('apiBackendInterceptor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('usa el backend remoto cuando el frontend no se abre desde localhost', async () => {
    const fetchMock = vi.fn();
    const http = configurar('app.example.com', fetchMock);
    const httpClient = TestBed.inject(HttpClient);

    const respuesta = firstValueFrom(httpClient.get(`${REMOTO}/materias`));
    const peticion = await esperarPeticion(http, `${REMOTO}/materias`);
    peticion.flush([]);
    await respuesta;

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('usa el backend local cuando está disponible', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const http = configurar('localhost', fetchMock);
    const httpClient = TestBed.inject(HttpClient);

    const respuesta = firstValueFrom(httpClient.get(`${REMOTO}/materias`));
    const peticion = await esperarPeticion(http, `${LOCAL}/materias`);
    peticion.flush([]);
    await respuesta;

    expect(fetchMock).toHaveBeenCalledWith(
      `${LOCAL}/test`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('usa el backend remoto si el backend local no responde', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('sin conexión'));
    const http = configurar('127.0.0.1', fetchMock);
    const httpClient = TestBed.inject(HttpClient);

    const respuesta = firstValueFrom(httpClient.get(`${REMOTO}/materias`));
    const peticion = await esperarPeticion(http, `${REMOTO}/materias`);
    peticion.flush([]);
    await respuesta;

    expect(fetchMock).toHaveBeenCalled();
  });

  it('usa el backend remoto si el backend local responde con error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    const http = configurar('localhost', fetchMock);
    const httpClient = TestBed.inject(HttpClient);

    const respuesta = firstValueFrom(httpClient.get(`${REMOTO}/materias`));
    const peticion = await esperarPeticion(http, `${REMOTO}/materias`);
    peticion.flush([]);
    await respuesta;

    expect(fetchMock).toHaveBeenCalled();
  });

  it('no intercepta peticiones que no son de la API', async () => {
    const fetchMock = vi.fn();
    const http = configurar('localhost', fetchMock);
    const httpClient = TestBed.inject(HttpClient);

    const respuesta = firstValueFrom(httpClient.get('https://otro-servicio.example.com/datos'));
    const peticion = await esperarPeticion(http, 'https://otro-servicio.example.com/datos');
    peticion.flush({});
    await respuesta;

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
