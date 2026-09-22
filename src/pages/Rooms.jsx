import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { RoomCard } from '../components/RoomCard';
import { RoomDetailsModal } from '../components/RoomDetailsModal';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  SlidersHorizontal,
  Calendar
} from 'lucide-react';

export const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Filters
  const [acFilter, setAcFilter] = useState(searchParams.get('ac') || 'all');
  const [capacityFilter, setCapacityFilter] = useState(searchParams.get('guests') || 'all');
  const [priceSort, setPriceSort] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dates for availability check
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');

  useEffect(() => {
    StorageService.init();
    setRooms(StorageService.getRooms());
  }, []);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // AC status
      if (acFilter !== 'all' && r.ac_status !== acFilter) return false;
      
      // Capacity
      if (capacityFilter !== 'all') {
        const reqCap = parseInt(capacityFilter, 10);
        if (r.capacity < reqCap) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.room_name.toLowerCase().includes(q);
        const matchesType = r.room_type.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (priceSort === 'low-to-high') return a.price - b.price;
      if (priceSort === 'high-to-low') return b.price - a.price;
      return 0;
    });
  }, [rooms, acFilter, capacityFilter, priceSort, searchQuery]);

  const handleResetFilters = () => {
    setAcFilter('all');
    setCapacityFilter('all');
    setPriceSort('none');
    setSearchQuery('');
    setCheckIn('');
    setCheckOut('');
    setSearchParams({});
  };

  return (
    <div className="syn-main-content">
      {/* Header Banner */}
      <section style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', padding: '3.5rem 0', position: 'relative' }}>
        <div className="syn-container" style={{ textAlign: 'center' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
            Accommodations & Tariffs
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Comfortable Pilgrim Rooms & Suites
          </h1>
          <p style={{ color: '#D6CEC5', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
            Choose from our curated collection of clean, peaceful AC and Non-AC accommodations suited for solo pilgrims, couples, and large devotee families.
          </p>
        </div>
      </section>

      {/* Filter & Listing Section */}
      <section style={{ padding: '3rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="syn-container">
          {/* Filter Bar */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
              
              {/* Search query */}
              <div className="form-group">
                <label className="form-label">
                  <Search size={14} color="var(--primary)" /> Search Room Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family Suite, Executive..."
                  className="form-control"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* AC Preference */}
              <div className="form-group">
                <label className="form-label">
                  <SlidersHorizontal size={14} color="var(--primary)" /> Category
                </label>
                <select
                  className="form-control"
                  value={acFilter}
                  onChange={(e) => setAcFilter(e.target.value)}
                >
                  <option value="all">All (AC & Non-AC)</option>
                  <option value="AC">AC Rooms</option>
                  <option value="Non-AC">Non-AC Rooms</option>
                </select>
              </div>

              {/* Minimum Capacity */}
              <div className="form-group">
                <label className="form-label">
                  <Users size={14} color="var(--primary)" /> Min. Capacity
                </label>
                <select
                  className="form-control"
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                >
                  <option value="all">Any Capacity</option>
                  <option value="2">2+ Guests</option>
                  <option value="3">3+ Guests</option>
                  <option value="4">4+ Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>

              {/* Price Sort */}
              <div className="form-group">
                <label className="form-label">
                  <Filter size={14} color="var(--primary)" /> Sort By Price
                </label>
                <select
                  className="form-control"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value)}
                >
                  <option value="none">Featured</option>
                  <option value="low-to-high">Price: Low to High</option>
                  <option value="high-to-low">Price: High to Low</option>
                </select>
              </div>

              {/* Reset Filter Button */}
              <button
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Reset all filters"
              >
                <RotateCcw size={15} /> Reset
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
              Showing {filteredRooms.length} room option{filteredRooms.length === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              All tariffs include 24/7 hot water, pure drinking water & Wi-Fi
            </div>
          </div>

          {/* Room Cards Grid */}
          {filteredRooms.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {filteredRooms.map((room) => (
                <RoomCard key={room.room_id} room={room} onOpenDetails={setSelectedRoom} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No matching rooms found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Try adjusting your search criteria or resetting filters to see available options.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                <RotateCcw size={16} /> Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};
