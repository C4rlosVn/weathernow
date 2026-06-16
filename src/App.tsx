import { useState } from "react";

type Weather = {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  wind: number;
};

function getWeatherEmoji(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes("clear")) return "☀️";
  if (d.includes("cloud")) return "☁️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
  if (d.includes("thunder")) return "⛈️";
  if (d.includes("snow")) return "❄️";
  if (d.includes("mist") || d.includes("fog")) return "🌫️";
  return "🌤️";
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const apiKey = import.meta.env.VITE_OWM_KEY || "demo";
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      if (!res.ok) {
        const msg = res.status === 404 ? "City not found" : "Failed to fetch weather";
        throw new Error(msg);
      }
      const data = await res.json();
      setWeather({
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        city: data.name,
        country: data.sys.country,
        wind: Math.round(data.wind.speed * 3.6),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-8">WeatherNow</h1>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Enter city name..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          onClick={search}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-colors"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      {weather && (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
          <p className="text-6xl mb-2">{getWeatherEmoji(weather.description)}</p>
          <p className="text-5xl font-bold mb-1">{weather.temp}°C</p>
          <p className="text-slate-400 capitalize mb-6">{weather.description}</p>
          <p className="text-xl font-semibold mb-6">
            {weather.city}, {weather.country}
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">Feels Like</p>
              <p className="font-semibold">{weather.feelsLike}°C</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">Humidity</p>
              <p className="font-semibold">{weather.humidity}%</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400">Wind</p>
              <p className="font-semibold">{weather.wind} km/h</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-slate-500 text-xs mt-8">
        Powered by OpenWeather API
      </p>
    </main>
  );
}
