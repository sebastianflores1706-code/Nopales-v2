import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { MapPin, Eye, EyeOff, LogIn, UserPlus, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { loginUsuario, registerUsuario, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, usuario, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Login state
  const [loginCorreo, setLoginCorreo] = useState("");
  const [loginContrasena, setLoginContrasena] = useState("");
  const [loginMostrar, setLoginMostrar] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regNombre, setRegNombre] = useState("");
  const [regCorreo, setRegCorreo] = useState("");
  const [regContrasena, setRegContrasena] = useState("");
  const [regConfirmar, setRegConfirmar] = useState("");
  const [regMostrar, setRegMostrar] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  if (!isLoading && isAuthenticated && usuario) {
    return <Navigate to={usuario.rol === "admin" ? "/" : "/portal"} replace />;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const data = await loginUsuario(loginCorreo, loginContrasena);
      login(data.usuario);
      navigate(data.usuario.rol === "admin" ? "/" : "/portal", { replace: true });
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? "Error al iniciar sesión"
          : "No se pudo conectar con el servidor";
      setLoginError(mensaje);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (regContrasena.length < 6) {
      setRegError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (regContrasena !== regConfirmar) {
      setRegError("Las contraseñas no coinciden");
      return;
    }

    setRegLoading(true);
    try {
      const data = await registerUsuario(regNombre, regCorreo, regContrasena);
      login(data.usuario);
      navigate("/portal", { replace: true });
    } catch (err) {
      const mensaje =
        err instanceof ApiError
          ? (err.data as { error?: string })?.error ?? "Error al registrarse"
          : "No se pudo conectar con el servidor";
      setRegError(mensaje);
    } finally {
      setRegLoading(false);
    }
  }

  const panelBg = theme === "dark"
    ? "linear-gradient(145deg, hsl(152 50% 8%) 0%, hsl(152 45% 13%) 50%, hsl(200 25% 7%) 100%)"
    : "linear-gradient(145deg, hsl(152 50% 18%) 0%, hsl(152 42% 26%) 50%, hsl(200 30% 20%) 100%)";

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Toggle de tema — esquina superior derecha */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="absolute top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden"
        style={{ background: panelBg }}
      >
        {/* Textura de puntos */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Halo superior izquierdo */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(152 55% 45%) 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        {/* Halo inferior derecho */}
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(210 60% 50%) 0%, transparent 70%)", filter: "blur(48px)" }}
        />

        {/* Halo central sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(152 45% 55%) 0%, transparent 70%)", filter: "blur(60px)" }}
        />

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-14 py-16 space-y-10">

          {/* Logo + nombre */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-white/70 uppercase">Nopales</span>
          </div>

          {/* Headline */}
          <div className="space-y-5">
            <h2 className="text-[2.4rem] font-bold leading-tight tracking-tight text-white">
              Gestiona tus espacios con una experiencia más inteligente
            </h2>
            <p className="text-base text-white/55 leading-relaxed max-w-xs">
              Reservaciones, pagos y control operativo en una sola plataforma moderna, clara y profesional.
            </p>
          </div>

          {/* Separador */}
          <div className="h-px w-12 bg-white/20" />

          {/* Features */}
          <div className="space-y-4">
            {[
              { label: "Gestión de espacios públicos", sub: "Controla disponibilidad y estado en tiempo real" },
              { label: "Reservaciones y pagos", sub: "Flujo completo desde solicitud hasta contrato" },
              { label: "Panel administrativo", sub: "Visibilidad total con métricas y reportes" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 shrink-0 rounded-md bg-white/10 border border-white/15 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{feat.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{feat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer del panel */}
        <div className="relative z-10 px-14 py-6 border-t border-white/10">
          <p className="text-xs text-white/30 tracking-wide">
            Sistema Municipal · Versión 2.0
          </p>
        </div>
      </div>

      {/* Panel derecho — formularios */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo móvil */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">NOPALES</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión de Espacios Públicos</p>
            </div>
          </div>

          {/* Encabezado */}
          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Bienvenido</h2>
            <p className="text-sm text-muted-foreground">
              Inicia sesión en tu cuenta o crea una nueva
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-3.5 w-3.5" />
                Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="registro" className="gap-2">
                <UserPlus className="h-3.5 w-3.5" />
                Registrarse
              </TabsTrigger>
            </TabsList>

            {/* ── LOGIN ── */}
            <TabsContent value="login">
              <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">Iniciar sesión</h3>
                  <p className="text-xs text-muted-foreground">
                    Ingresa tus credenciales para acceder al sistema
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-correo">Correo electrónico</Label>
                    <Input
                      id="login-correo"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={loginCorreo}
                      onChange={(e) => setLoginCorreo(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-contrasena">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="login-contrasena"
                        type={loginMostrar ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginContrasena}
                        onChange={(e) => setLoginContrasena(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setLoginMostrar((v) => !v)}
                        tabIndex={-1}
                      >
                        {loginMostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                      {loginError}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? "Ingresando..." : "Ingresar"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* ── REGISTRO ── */}
            <TabsContent value="registro">
              <div className="rounded-xl border bg-card shadow-sm p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">Crear cuenta</h3>
                  <p className="text-xs text-muted-foreground">
                    Regístrate para reservar espacios públicos municipales
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-nombre">Nombre completo</Label>
                    <Input
                      id="reg-nombre"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-correo">Correo electrónico</Label>
                    <Input
                      id="reg-correo"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={regCorreo}
                      onChange={(e) => setRegCorreo(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-contrasena">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="reg-contrasena"
                        type={regMostrar ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={regContrasena}
                        onChange={(e) => setRegContrasena(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setRegMostrar((v) => !v)}
                        tabIndex={-1}
                      >
                        {regMostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirmar">Confirmar contraseña</Label>
                    <Input
                      id="reg-confirmar"
                      type={regMostrar ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={regConfirmar}
                      onChange={(e) => setRegConfirmar(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  {regError && (
                    <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                      {regError}
                    </p>
                  )}

                  {regSuccess && (
                    <p className="text-sm text-success bg-success/10 px-3 py-2 rounded-lg">
                      {regSuccess}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={regLoading}>
                    {regLoading ? "Creando cuenta..." : "Crear cuenta"}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center">
                  Al registrarte obtendrás acceso al portal ciudadano para gestionar tus reservaciones.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground">
            Sistema Municipal · Acceso exclusivo para personal autorizado y ciudadanos registrados
          </p>
        </div>
      </div>
    </div>
  );
}
