
import React, { useState, useEffect } from 'react';
import { Search, Map as MapIcon, Menu, Sparkles, Navigation, Users, Plus, X, User, ArrowUpDown, Filter, MapPin, Calendar, Megaphone, ChevronDown, ChevronUp, Ban, RotateCcw } from 'lucide-react';
import MapVisual from './components/MapVisual';
import ActivityCard from './components/ActivityCard';
import Loader3D from './components/Loader3D';
import { fetchActivities } from './services/geminiService';
import { Activity, AppState, UserPreferences, SquadMember } from './types';

// Haversine formula to calculate distance between two coordinates
// Returns object with display text and raw numeric value for sorting
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): { text: string, value: number } {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  
  let text = `${d.toFixed(1)} km`;
  if (d < 1) text = `${(d * 1000).toFixed(0)} m`;
  
  return { text, value: d };
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

type SortOption = 'match' | 'distance' | 'price';
type SidebarTab = 'find' | 'host';

const EXCLUSION_OPTIONS = [
    "Nightclubs / Loud Music",
    "Alcohol / Bars",
    "Sports / Physical",
    "Museums / History",
    "Seafood",
    "Fast Food",
    "Walking / Hiking",
    "Crowded Places",
    "Expensive Entry",
    "Vegan Only"
];

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [activeTab, setActiveTab] = useState<SidebarTab>('find');
  
  // Geolocation State
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // Form State
  const [locationName, setLocationName] = useState("Paris, France");
  const [squad, setSquad] = useState<SquadMember[]>([
    { id: '1', name: 'Me', interest: '' }
  ]);
  const [budget, setBudget] = useState<UserPreferences['budget']>("Moderate");
  
  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  
  // Temporary Input State for adding friends
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberInterest, setNewMemberInterest] = useState("");
  
  // Host Event State
  const [hostEventName, setHostEventName] = useState("");
  const [hostEventCategory, setHostEventCategory] = useState<Activity['category']>("Activity");
  const [hostEventPrice, setHostEventPrice] = useState("");
  const [hostEventDesc, setHostEventDesc] = useState("");
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Get User Location on Mount (silent)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Default to Paris center if blocked
          setUserCoords({ lat: 48.8566, lng: 2.3522 });
        }
      );
    }
  }, []);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setLocationName("📍 Current GPS Location");
        },
        (error) => {
          alert("Could not access location. Please check browser permissions.");
        }
      );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
  };

  const addSquadMember = () => {
    if (!newMemberName || !newMemberInterest) return;
    const newMember: SquadMember = {
      id: Date.now().toString(),
      name: newMemberName,
      interest: newMemberInterest
    };
    setSquad([...squad, newMember]);
    setNewMemberName("");
    setNewMemberInterest("");
  };

  const removeSquadMember = (id: string) => {
    setSquad(squad.filter(m => m.id !== id));
  };

  const updateSquadMember = (id: string, interest: string) => {
    setSquad(squad.map(m => m.id === id ? { ...m, interest } : m));
  }

  const toggleExclusion = (category: string) => {
      setExcludedCategories(prev => 
          prev.includes(category) 
              ? prev.filter(c => c !== category)
              : [...prev, category]
      );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (squad.length === 0) return;
    
    // Validate that the main user has an interest entered
    if (squad[0].interest.trim() === "") {
        alert("Please enter your interest first!");
        return;
    }

    setAppState(AppState.SEARCHING);
    setIsSidebarOpen(true);
    setSortBy('match'); // Reset sort on new search
    
    try {
      const results = await fetchActivities({
        locationName,
        squad,
        budget,
        duration: 'Half day',
        userCoordinates: userCoords || undefined,
        excludedCategories
      });
      
      // Merge with custom activities (User generated)
      const allResults = [...results, ...customActivities];
      
      // Calculate distances if we have user coords
      const resultsWithDistance = allResults.map(act => {
        if (userCoords) {
            const dist = calculateDistance(userCoords.lat, userCoords.lng, act.coordinates.lat, act.coordinates.lng);
            return {
                ...act,
                distance: dist.text,
                distanceValue: dist.value
            };
        }
        return { ...act, distanceValue: Infinity };
      });
      
      setActivities(resultsWithDistance);
      if (resultsWithDistance.length > 0) {
        setSelectedActivity(resultsWithDistance[0]);
      }
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
    }
  };

  const handleHostEvent = (e: React.FormEvent) => {
      e.preventDefault();
      if (!hostEventName || !hostEventDesc) return;

      const newActivity: Activity = {
          id: `custom-${Date.now()}`,
          name: hostEventName,
          description: hostEventDesc,
          fullDescription: hostEventDesc,
          matchReason: "Community Event (User Hosted)",
          vibeScore: 100, // User generated content gets top score for visibility
          category: hostEventCategory,
          priceRange: "Low", // Default
          pricePerPerson: hostEventPrice || "Free",
          coordinates: userCoords || { lat: 48.8566, lng: 2.3522 },
          isUserGenerated: true,
          distance: "0 m", // At user location
          distanceValue: 0
      };

      setCustomActivities([...customActivities, newActivity]);
      
      // If we are already viewing results, append immediately
      if (appState === AppState.RESULTS) {
          setActivities([newActivity, ...activities]);
      } else {
          // If in Idle, show user that it's added (maybe switch to results logic, or just stay)
          alert("Event Published! It will appear in search results.");
      }

      // Reset form
      setHostEventName("");
      setHostEventDesc("");
      setHostEventPrice("");
      setActiveTab('find'); // Switch back to find mode
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setActivities([]); // Clear map markers from search results
    setSelectedActivity(null);
  };

  const getSortedActivities = () => {
      const sorted = [...activities];
      switch (sortBy) {
          case 'match':
              // High to Low. Prioritize user generated
              return sorted.sort((a, b) => {
                  if (a.isUserGenerated && !b.isUserGenerated) return -1;
                  if (!a.isUserGenerated && b.isUserGenerated) return 1;
                  return b.vibeScore - a.vibeScore;
              });
          case 'distance':
              // Low to High
              return sorted.sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));
          case 'price':
              // Low to High (Low=1, Medium=2, High=3)
              const priceMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
              return sorted.sort((a, b) => priceMap[a.priceRange] - priceMap[b.priceRange]);
          default:
              return sorted;
      }
  };

  return (
    <div className="relative w-full h-screen bg-urban-black overflow-hidden flex flex-col md:flex-row">
      
      {/* --- Map Layer (Background) --- */}
      <div className="absolute inset-0 z-0">
        <MapVisual 
          activities={getSortedActivities()}
          selectedActivity={selectedActivity}
          onSelect={setSelectedActivity}
        />
      </div>

      {/* --- Sidebar (Glassmorphism Panel) --- */}
      <div 
        className={`
            absolute z-20 top-4 bottom-4 left-4 w-full max-w-[90vw] md:w-[450px] 
            transition-transform duration-500 ease-in-out transform
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}
        `}
      >
        <div className="h-full flex flex-col bg-urban-dark/90 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Header of Sidebar */}
            <div className="p-6 pb-2 border-b border-gray-800/50">
                <div className="flex justify-between items-center mb-0"> {/* Reduced gap */}
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-urban-neon to-urban-purple py-2 pr-2">
                        G.O
                    </h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
                        Close
                    </button>
                </div>
                
                {appState === AppState.IDLE && (
                   <div className="flex justify-between items-end mb-2">
                       <p className="text-gray-400 text-sm">
                           Build your squad. We'll find the perfect compromise.
                       </p>
                   </div>
                )}

                {/* Tab Switcher (Find vs Host) */}
                {appState === AppState.IDLE && (
                    <div className="flex gap-2 p-1 bg-gray-900/50 rounded-xl mb-4">
                        <button 
                            onClick={() => setActiveTab('find')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'find' ? 'bg-urban-card text-white shadow-lg border border-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Search size={14} /> Find Vibes
                        </button>
                        <button 
                            onClick={() => setActiveTab('host')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'host' ? 'bg-urban-card text-white shadow-lg border border-gray-700' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Megaphone size={14} /> Host Event
                        </button>
                    </div>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar relative">
                
                {/* --- 1. IDLE STATE: Input Form --- */}
                {appState === AppState.IDLE && activeTab === 'find' && (
                    <form onSubmit={handleSearch} className="space-y-6 mt-2">
                        
                        {/* Location Input (Moved here from header) */}
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                             <div className="flex gap-2">
                                 <div className="relative flex-1">
                                     <MapPin className="absolute left-3 top-3 text-gray-500" size={16} />
                                     <input 
                                        type="text"
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        className="w-full bg-urban-card border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white focus:border-urban-neon focus:ring-1 focus:ring-urban-neon outline-none"
                                        placeholder="Enter city or use GPS"
                                     />
                                 </div>
                                 <button 
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    className="px-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-urban-neon border border-gray-700 transition-colors"
                                    title="Use my location"
                                 >
                                     <Navigation size={18} />
                                 </button>
                             </div>
                        </div>

                        {/* Squad Builder Section */}
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">The Squad</label>
                            
                            {/* Existing Members */}
                            <div className="space-y-2">
                                {squad.map((member, index) => (
                                    <div key={member.id} className="flex items-center gap-2 bg-urban-card p-2 rounded-lg border border-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-urban-purple to-blue-600 flex items-center justify-center text-xs font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-400 font-bold">{member.name}</p>
                                            {index === 0 ? (
                                                <input 
                                                    type="text"
                                                    placeholder="What's your vibe today?"
                                                    value={member.interest}
                                                    onChange={(e) => updateSquadMember(member.id, e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 text-sm text-urban-neon focus:ring-0 placeholder-gray-600"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-200">{member.interest}</p>
                                            )}
                                        </div>
                                        {index !== 0 && (
                                            <button type="button" onClick={() => removeSquadMember(member.id)} className="text-gray-500 hover:text-red-400">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add New Member */}
                            <div className="flex gap-2 items-end pt-2 border-t border-gray-800 border-dashed">
                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        placeholder="Name"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        className="w-full bg-urban-black border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-urban-purple focus:ring-0 mb-2"
                                    />
                                    <input 
                                        type="text"
                                        placeholder="Interest (e.g. Techno, Sushi)"
                                        value={newMemberInterest}
                                        onChange={(e) => setNewMemberInterest(e.target.value)}
                                        className="w-full bg-urban-black border border-gray-700 rounded-lg p-2 text-sm text-white focus:border-urban-purple focus:ring-0"
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={addSquadMember}
                                    className="h-20 w-12 bg-gray-800 rounded-lg flex items-center justify-center text-urban-neon hover:bg-gray-700 transition-colors"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Budget per Person</label>
                             <select 
                                 value={budget}
                                 onChange={(e) => setBudget(e.target.value as any)}
                                 className="w-full bg-urban-card border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-1 focus:ring-urban-neon outline-none"
                             >
                                 <option value="Cheap">Cheap (&lt; 20€)</option>
                                 <option value="Moderate">Moderate (20€ - 50€)</option>
                                 <option value="Expensive">Expensive (&gt; 50€)</option>
                             </select>
                        </div>

                        {/* Advanced Settings (Exclusions) */}
                        <div className="border border-gray-800 rounded-xl overflow-hidden">
                             <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between p-3 bg-gray-900/50 hover:bg-gray-800 transition-colors"
                             >
                                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                     <Filter size={14} /> Advanced Settings
                                 </span>
                                 {showAdvanced ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                             </button>
                             
                             {showAdvanced && (
                                 <div className="p-4 bg-black/20 animate-in slide-in-from-top-2">
                                     <div className="flex items-center gap-2 mb-3 text-red-400 text-xs font-medium">
                                        <Ban size={12} />
                                        <span>Select things to AVOID:</span>
                                     </div>
                                     <div className="flex flex-wrap gap-2">
                                         {EXCLUSION_OPTIONS.map(option => {
                                             const isSelected = excludedCategories.includes(option);
                                             return (
                                                 <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => toggleExclusion(option)}
                                                    className={`
                                                        px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all
                                                        ${isSelected 
                                                            ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                                                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                                                        }
                                                    `}
                                                 >
                                                     {option}
                                                 </button>
                                             )
                                         })}
                                     </div>
                                 </div>
                             )}
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center space-x-2 transition-all bg-gradient-to-r from-urban-neon to-urban-purple hover:shadow-[0_0_20px_rgba(189,0,255,0.5)]"
                        >
                            <Sparkles size={20} />
                            <span>Generate Plan</span>
                        </button>
                    </form>
                )}

                {/* --- 1.B HOST EVENT FORM --- */}
                {appState === AppState.IDLE && activeTab === 'host' && (
                    <form onSubmit={handleHostEvent} className="space-y-6 mt-2 animate-in fade-in duration-300">
                         <div className="p-4 bg-urban-card border border-urban-neon/30 rounded-xl mb-6">
                             <div className="flex items-start gap-3">
                                 <Megaphone className="text-urban-neon shrink-0 mt-1" size={20} />
                                 <div>
                                     <h3 className="text-white font-bold text-sm">Host a Public Event</h3>
                                     <p className="text-xs text-gray-400 mt-1">
                                         Share a local activity, happy hour, or event with the community. It will appear on the map for others nearby.
                                     </p>
                                 </div>
                             </div>
                         </div>

                         <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event Title</label>
                             <input 
                                type="text"
                                required
                                value={hostEventName}
                                onChange={(e) => setHostEventName(e.target.value)}
                                className="w-full bg-urban-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-urban-neon focus:ring-1 focus:ring-urban-neon outline-none"
                                placeholder="e.g. Rooftop Jazz Night"
                             />
                         </div>

                         <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                             <select 
                                 value={hostEventCategory}
                                 onChange={(e) => setHostEventCategory(e.target.value as any)}
                                 className="w-full bg-urban-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-1 focus:ring-urban-neon outline-none"
                             >
                                 <option value="Activity">Activity</option>
                                 <option value="Food">Food</option>
                                 <option value="Nightlife">Nightlife</option>
                                 <option value="Culture">Culture</option>
                                 <option value="Outdoors">Outdoors</option>
                             </select>
                         </div>

                         <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price / Entry</label>
                             <input 
                                type="text"
                                value={hostEventPrice}
                                onChange={(e) => setHostEventPrice(e.target.value)}
                                className="w-full bg-urban-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-urban-neon focus:ring-1 focus:ring-urban-neon outline-none"
                                placeholder="e.g. Free, 10€ Entry, Drinks only"
                             />
                         </div>

                         <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description / Vibe</label>
                             <textarea 
                                required
                                rows={3}
                                value={hostEventDesc}
                                onChange={(e) => setHostEventDesc(e.target.value)}
                                className="w-full bg-urban-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-urban-neon focus:ring-1 focus:ring-urban-neon outline-none resize-none"
                                placeholder="Describe what's happening..."
                             />
                         </div>

                         <div className="text-xs text-gray-500 flex items-center gap-2">
                             <MapPin size={12} />
                             Using your current GPS location
                         </div>

                         <button 
                            type="submit" 
                            className="w-full py-4 rounded-xl font-bold text-black flex items-center justify-center space-x-2 transition-all bg-white hover:bg-gray-200"
                        >
                            <Plus size={20} />
                            <span>Publish Event</span>
                        </button>
                    </form>
                )}

                {/* --- 2. LOADING STATE: 3D Animation --- */}
                {appState === AppState.SEARCHING && (
                    <div className="flex flex-col h-full animate-in fade-in duration-700">
                        <Loader3D />
                    </div>
                )}

                {/* --- 3. RESULTS STATE: List --- */}
                {appState === AppState.RESULTS && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
                        <div className="flex justify-between items-end mb-2">
                             <div>
                                 <h2 className="text-white font-semibold">Best Compromises</h2>
                                 <p className="text-xs text-gray-500">{squad.length} friends • {locationName}</p>
                             </div>
                             <button 
                                onClick={handleReset} 
                                className="flex items-center gap-2 text-xs text-urban-neon hover:text-white transition-colors font-medium hover:bg-urban-card px-2 py-1 rounded-lg"
                             >
                                <RotateCcw size={14} /> New Search
                             </button>
                        </div>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                            <span className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                                <ArrowUpDown size={12} /> Sort by:
                            </span>
                            
                            {(['match', 'distance', 'price'] as SortOption[]).map(option => (
                                <button
                                    key={option}
                                    onClick={() => setSortBy(option)}
                                    className={`
                                        px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize whitespace-nowrap
                                        ${sortBy === option 
                                            ? 'bg-urban-neon text-black' 
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        
                        {getSortedActivities().map((act) => (
                            <ActivityCard 
                                key={act.id} 
                                activity={act} 
                                isSelected={selectedActivity?.id === act.id}
                                onSelect={setSelectedActivity}
                                locationContext={locationName}
                                userCoords={userCoords}
                            />
                        ))}
                        
                        <div className="p-4 bg-urban-card/50 rounded-xl border border-dashed border-gray-700 text-center mt-6">
                            <p className="text-gray-500 text-xs">
                                Want to invite the group?
                            </p>
                            <button className="mt-2 text-urban-neon text-sm font-medium hover:text-urban-purple transition-colors">
                                Share Shortlist
                            </button>
                        </div>
                    </div>
                )}
                
                {appState === AppState.ERROR && (
                    <div className="text-center p-8">
                        <p className="text-red-400 mb-4">Something went wrong exploring the city.</p>
                        <button 
                            onClick={handleReset}
                            className="text-urban-neon hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- Toggle Sidebar Button (Visible when sidebar closed) --- */}
      {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute bottom-6 left-6 z-30 p-4 bg-urban-neon text-black rounded-full shadow-lg hover:scale-110 transition-transform"
          >
              <Menu size={24} />
          </button>
      )}

    </div>
  );
}

export default App;
