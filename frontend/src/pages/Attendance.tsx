import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, CheckCircle2, LogOut, Clock, AlertCircle } from 'lucide-react';
import { attendanceService } from '../api/attendance';
import { toast } from 'sonner';

export const Attendance: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    getCurrentLocation();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      toast.error('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
        }
      );
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'attendance.jpg', { type: 'image/jpeg' });
          setPhoto(file);
          setPhotoPreview(canvas.toDataURL('image/jpeg'));
        }
      }, 'image/jpeg');
    }
  };

  const handleCheckIn = async () => {
    if (!photo || !location) {
      toast.error('Lengkapi foto dan lokasi sebelum absen.');
      return;
    }

    setLoading(true);
    try {
      await attendanceService.checkIn(location.lat, location.lng, photo);
      toast.success('Absensi masuk berhasil!');
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err: any) {
      toast.error(err.message || 'Gagal melakukan absensi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      toast.error('Gagal mendapatkan lokasi.');
      return;
    }

    setLoading(true);
    try {
      await attendanceService.checkOut(location.lat, location.lng);
      toast.success('Absensi keluar berhasil!');
    } catch (err: any) {
      toast.error(err.message || 'Gagal melakukan absensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-900 p-4 pb-12 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <header className="flex justify-between items-center px-2">
          <div>
            <h1 className="text-3xl font-bold italic tracking-tight text-indigo-950">Presensi.</h1>
            <p className="text-slate-500 text-sm font-medium">RSUD Wajo App</p>
          </div>
          <div className="bg-white text-indigo-600 p-3 rounded-2xl shadow-sm border border-slate-100">
            <Clock size={24} />
          </div>
        </header>

        <section className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-[6px] border-white bg-slate-200 shadow-xl">
          {!photoPreview ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover mirror transform scale-x-[-1]"
            />
          ) : (
            <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
          )}

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center w-full">
            {!photoPreview ? (
              <button 
                onClick={capturePhoto}
                className="h-20 w-20 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Camera size={32} />
              </button>
            ) : (
              <button 
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-bold shadow-xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                Ulangi Foto
              </button>
            )}
          </div>
        </section>

        <canvas ref={canvasRef} className="hidden" />

        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${location ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              <MapPin size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Lokasi Anda</p>
              <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">
                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Memindai lokasi GPS...'}
              </p>
            </div>
            {location && <CheckCircle2 size={24} className="text-emerald-500" />}
          </div>

          {!location && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="font-medium leading-relaxed">Izinkan akses lokasi ponsel dengan akurasi tinggi untuk absensi.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={loading || !location || !photoPreview}
            onClick={handleCheckIn}
            className="flex flex-col items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white p-6 rounded-[2rem] transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
          >
            <CheckCircle2 size={28} className="group-disabled:opacity-50" />
            <span className="font-bold text-lg">Masuk</span>
          </button>
          <button 
            disabled={loading || !location}
            onClick={handleCheckOut}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 p-6 rounded-[2rem] transition-all shadow-sm active:scale-95 group"
          >
            <LogOut size={28} className="text-slate-500 group-disabled:opacity-50" />
            <span className="font-bold text-lg">Keluar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
