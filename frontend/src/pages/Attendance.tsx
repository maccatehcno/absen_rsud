import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, CheckCircle2, LogOut, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { attendanceService } from '../api/attendance';
import { toast } from 'sonner';

// Fix default marker icons broken by webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom blue pulse marker for user position
const userIcon = L.divIcon({
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#4f46e5;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(79,70,229,0.35);
  "></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Red hospital marker
const rsudIcon = L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:8px;
    background:#ef4444;border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.25);
    display:flex;align-items:center;justify-content:center;
    font-size:14px;
  ">🏥</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper: re-center map when location updates
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng]);
  return null;
};

// RSUD Wajo approximate coordinates (configurable)
const RSUD_LAT = -4.0172;
const RSUD_LNG = 120.0225;
const RADIUS_M  = 100;

function formatTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180;
  const df = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(df/2)**2 + Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Static Leaflet path options for the geofencing circle
const CIRCLE_OPTIONS = { color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.08, weight: 2 };

export const Attendance: React.FC = () => {
  const [stream, setStream]           = useState<MediaStream | null>(null);
  const [photo, setPhoto]             = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation]       = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [currentTime, setCurrentTime] = useState(formatTime());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    getCurrentLocation();
    const tick = setInterval(() => setCurrentTime(formatTime()), 30000);
    return () => {
      clearInterval(tick);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(ms);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch {
      toast.error('Gagal mengakses kamera.');
    }
  };

  const getCurrentLocation = () => {
    setLocError(false);
    if (!('geolocation' in navigator)) { setLocError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()    => { setLocError(true); toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')?.drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (blob) {
        setPhoto(new File([blob], 'attendance.jpg', { type: 'image/jpeg' }));
        setPhotoPreview(c.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg', 0.85);
  };

  const handleCheckIn = async () => {
    if (!photo || !location) { toast.error('Lengkapi foto dan aktifkan lokasi.'); return; }
    setLoading(true);
    try {
      await attendanceService.checkIn(location.lat, location.lng, photo);
      toast.success('✅ Absensi masuk berhasil!');
      setPhoto(null); setPhotoPreview(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal absensi masuk.');
    } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!location) { toast.error('Gagal mendapatkan lokasi.'); return; }
    setLoading(true);
    try {
      await attendanceService.checkOut(location.lat, location.lng);
      toast.success('✅ Absensi keluar berhasil!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal absensi keluar.');
    } finally { setLoading(false); }
  };

  const distance = location ? getDistance(location.lat, location.lng, RSUD_LAT, RSUD_LNG) : null;
  const inRange  = distance !== null && distance <= RADIUS_M;

  // Memoize position objects to avoid infinite loops in React 18 / react-leaflet
  const mapCenter = React.useMemo(() => 
    location ? [location.lat, location.lng] as L.LatLngExpression : [RSUD_LAT, RSUD_LNG] as L.LatLngExpression, 
    [location?.lat, location?.lng]
  );
  
  const rsudPos = React.useMemo(() => [RSUD_LAT, RSUD_LNG] as L.LatLngExpression, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 pb-12">
      <div className="mx-auto max-w-md px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-extrabold italic tracking-tight text-indigo-950">Presensi.</h1>
            <p className="text-slate-500 text-sm font-medium">RSUD Lamaddukelleng Wajo</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-100 px-4 py-2.5 shadow-sm">
            <Clock size={16} className="text-indigo-500" />
            <span className="font-bold text-slate-800 text-sm">{currentTime}</span>
          </div>
        </div>

        {/* Camera Section */}
        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-white bg-slate-200 shadow-xl shadow-slate-200/60">
          {!photoPreview ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <img src={photoPreview} className="w-full h-full object-cover" alt="Foto Absensi" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-5 inset-x-0 flex justify-center">
            {!photoPreview ? (
              <button onClick={capturePhoto} className="h-16 w-16 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                <Camera size={26} />
              </button>
            ) : (
              <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="px-6 py-2.5 rounded-2xl bg-white/90 text-slate-900 font-bold text-sm shadow-xl hover:bg-white active:scale-95 transition-all flex items-center gap-2">
                <RefreshCw size={15} /> Ulangi Foto
              </button>
            )}
          </div>
          {photoPreview && (
            <div className="absolute top-4 right-4 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm flex items-center gap-1">
              <CheckCircle2 size={13} /> Foto OK
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* MAP SECTION */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-sm bg-white">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className={location ? 'text-indigo-500' : 'text-slate-300'} />
              <span className="text-sm font-bold text-slate-700">Lokasi Anda</span>
            </div>
            <div className="flex items-center gap-2">
              {location && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${inRange ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {inRange ? `✅ Dalam jangkauan` : `⚠️ ${distance}m dari RSUD`}
                </span>
              )}
              <button onClick={getCurrentLocation} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition-colors" title="Refresh lokasi">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div className="h-56 w-full relative">
            {location ? (
              <MapContainer
                center={mapCenter}
                zoom={17}
                className="h-full w-full"
                zoomControl={true}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap lat={location.lat} lng={location.lng} />

                {/* User location marker */}
                <Marker position={mapCenter} icon={userIcon}>
                  <Popup><strong>Posisi Anda</strong><br />{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</Popup>
                </Marker>

                {/* RSUD marker */}
                <Marker position={rsudPos} icon={rsudIcon}>
                  <Popup><strong>RSUD Lamaddukelleng Wajo</strong></Popup>
                </Marker>

                {/* Geofencing radius circle */}
                <Circle
                  center={rsudPos}
                  radius={RADIUS_M}
                  pathOptions={CIRCLE_OPTIONS}
                />
              </MapContainer>
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-50">
                {locError ? (
                  <div className="text-center space-y-2">
                    <AlertCircle size={28} className="mx-auto text-red-400" />
                    <p className="text-sm text-slate-500 font-medium">Lokasi tidak tersedia</p>
                    <button onClick={getCurrentLocation} className="text-sm text-indigo-600 font-bold hover:underline">Coba lagi</button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-sm text-slate-400 font-medium">Mendapatkan lokasi GPS...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coordinate detail */}
          {location && (
            <div className="px-4 py-2.5 border-t border-slate-50 flex gap-4 text-xs text-slate-400 font-medium bg-slate-50/50">
              <span>Lat: <span className="text-slate-600 font-bold">{location.lat.toFixed(6)}</span></span>
              <span>Lng: <span className="text-slate-600 font-bold">{location.lng.toFixed(6)}</span></span>
              {distance !== null && <span>Jarak: <span className="text-slate-600 font-bold">{distance}m</span></span>}
            </div>
          )}
        </div>

        {/* Warning if out of range */}
        {location && !inRange && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              Anda berada <strong>{distance}m</strong> dari RSUD Wajo (radius: {RADIUS_M}m). Absensi tetap bisa dilakukan untuk saat ini (mode testing).
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={loading || !location || !photoPreview}
            onClick={handleCheckIn}
            className="flex flex-col items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none text-white p-5 rounded-[2rem] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <CheckCircle2 size={26} />
            <span className="font-extrabold text-base">Masuk</span>
          </button>
          <button
            disabled={loading || !location}
            onClick={handleCheckOut}
            className="flex flex-col items-center justify-center gap-2.5 bg-white border-2 border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 p-5 rounded-[2rem] transition-all shadow-sm active:scale-95"
          >
            <LogOut size={26} className="text-slate-500" />
            <span className="font-extrabold text-base">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
