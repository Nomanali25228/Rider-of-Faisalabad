import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiGlobe, FiNavigation, FiInfo, FiSearch } from 'react-icons/fi';
import styles from './LocationPickerModal.module.css';
import { motion, AnimatePresence } from 'framer-motion';

// Sample data for the dropdowns
const locationData = {
    'Pakistan': {
        'Faisalabad': [
            'Allied Hospital Area', 'Allama Iqbal Colony', 'Al-Fayaz Colony', 'Amin Town', 'Aminpur Bazar', 'Aminpur Road',
            'Bakkar Mandi', 'Batala Colony', 'Bhowana Bazar', 'Canal Road', 'Canal View Colony', 'Chak 208 Road', 'Chak Jhumra',
            'Chenab Market', 'Chiniot Bazar', 'Citi Housing', 'Civil Lines', 'Clock Tower', 'D-Ground', 'Dhanola', 'Dijkot Road',
            'Dogar Basti', 'Eden Garden', 'Eden Orchard', 'Eden Valley', 'Faisal Town', 'FDA City', 'Gatwala', 'Ghanta Ghar Area',
            'Ghulam Muhammad Abad (All Sectors)', 'Gojra Road', 'Gulbahar Colony', 'Gulberg', 'Gulistan Colony', 'Hajiabad',
            'Harchowal', 'Ideal Garden', 'Iqbal Town', 'Ismail City', 'Jail Road', 'Jhang Bazar', 'Jhang Road', 'Jinnah Colony',
            'Karkhana Bazar', 'Kashmir Road', 'Khadija Mehmood Trust Hospital Area', 'Khurrianwala', 'Kohinoor City',
            'Kotheala Road', 'Kutchery Bazar', 'Madina Town', 'Makoana', 'Mansoorabad', 'Mall Road', 'Manawala', 'Millat Road',
            'Millat Town', 'Model City', 'Model Town', 'Montgomery Bazar', 'Murad Colony', 'Muslim Town', 'Narma Farm',
            'Nasirabad', 'Nishatabad', 'Novelty Bridge Area', 'Nagina Colony', 'Officers Colony 1', 'Officers Colony 2',
            'Painsara', 'Paradise Valley', 'Pasrur Road', 'People\'s Colony 1', 'People\'s Colony 2', 'Rail Bazar',
            'Railway Station Area', 'Raza Garden', 'Razabad', 'Rehman Gardens', 'Risalewala', 'Sabzi Mandi', 'Saddar Bazar',
            'Saeedabad', 'Sahianwala', 'Salarwala', 'Samanabad', 'Sant Pura', 'Sargodha Road', 'Satiana Road', 'Shahbaz Town',
            'Sheikhupura Road', 'Sidhu', 'Sitara Sapna City', 'Sohni Dharti', 'Susan Road', 'Tariqabad', 'Tata Market',
            'Tech Town', 'University of Agriculture Area', 'Value Addition City', 'Wapda City', 'Wapda Town', 'Yousafabad',
            'Zulfiqar Colony', 'Other Area'
        ],
        'Lahore': [
            'Gulberg I, II, III', 'DHA Phase 1-9', 'Model Town', 'Johar Town', 'Bahria Town', 'Iqbal Town', 'Walled City',
            'Cavalry Ground', 'Garden Town', 'Faisal Town', 'Township', 'Valencia', 'Wapda Town', 'Samanabad', 'Sabzazar',
            'Muslim Town', 'Rehmanpura', 'Garhi Shahu', 'Mughalpura', 'Baghbanpura', 'Shalamar', 'Harbanspura', 'Dharampura',
            'Cantt', 'Askari 1-11', 'Paragon City', 'Lake City', 'State Life', 'Green Town', 'Badami Bagh', 'Shahdara',
            'Raiwind', 'Thokar Niaz Baig', 'Chung', 'Kahna', 'Gajju Mata', 'Kot Lakhpat'
        ],
        'Islamabad': [
            'F-6', 'F-7', 'F-8', 'F-10', 'F-11', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11', 'G-13', 'G-15', 'E-7', 'E-11',
            'I-8', 'I-9', 'I-10', 'Blue Area', 'Bani Gala', 'DHA Phase 1-5', 'Bahria Town 1-9', 'Bahria Enclave',
            'Gulberg Residencia', 'Park View City', 'PWD', 'Soan Garden', 'Korang Town', 'Media Town', 'CBR Town',
            'Rawal Town', 'Chaktara', 'Tarnol', 'Bhara Kahu'
        ],
        'Karachi': [
            'DHA Phase 1-8', 'Clifton Blocks 1-9', 'Gulshan-e-Iqbal', 'North Nazimabad', 'PECHS', 'Korangi', 'Bahria Town Karachi',
            'Malir Cantt', 'FB Area', 'Nazimabad', 'Liaquatabad', 'Orangi Town', 'Surjani Town', 'Buffer Zone', 'Kemari',
            'Lyari', 'Saddar', 'II Chundrigar Road', 'Tariq Road', 'Defence View', 'Mehmoodabad', 'Shah Faisal Colony',
            'Landhi', 'Steel Town', 'Gulistan-e-Jauhar', 'Saadi Town', 'Scheme 33', 'Society Area'
        ],
        'Rawalpindi': [
            'Saddar', 'Bahria Town Phase 1-8', 'DHA Phase 1-4', 'Satellite Town', 'Peshawar Road', 'Adiala Road', 'Chaklala Scheme 1-3',
            'Gulrez', 'Westridge', 'Lalkurti', 'Tench Bhata', 'Shamsabad', 'Committee Chowk', 'Raja Bazar', 'Pindi Cantt',
            'Askari Villas', 'Media Town', 'Gulberg Pindi', 'Top City', 'Mumtaz City'
        ],
        'Multan': [
            'Gulgasht Colony', 'Multan Cantt', 'Wapda Town', 'Model Town', 'Bosan Road', 'Shah Rukne Alam', 'New Multan',
            'Shamsabad', 'Zakariya Town', 'MDA Colony', 'Officers Colony', 'Garden Town', 'Buch Villas'
        ],
        'Sialkot': [
            'Sialkot Cantt', 'Model Town', 'Sialkot City', 'Shahabpura', 'Small Industrial Estate', 'Pasrur Road', 'Defense Road',
            'Paris Road', 'Khadim Ali Road'
        ],
        'Gujranwala': [
            'Satellite Town', 'DC Colony', 'Citi Housing', 'Garden Town', 'DC Road', 'Rahwali Cantt', 'People\'s Colony',
            'Model Town', 'Wapda Town'
        ],
        'Peshawar': [
            'Hayatabad', 'Peshawar Cantt', 'University Road', 'Warsak Road', 'Ring Road', 'Gulbahar', 'Dalazak Road',
            'GT Road', 'Hayatabad Phase 1-7'
        ],
        'Quetta': [
            'Cantt', 'Jinnah Town', 'Samungli Road', 'Model Town', 'Satellite Town', 'Zarghun Road'
        ]
    }
};

export default function LocationPickerModal({ isOpen, onClose, onSelect, title = "Select Location" }) {
    const [country, setCountry] = useState('Pakistan');
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [areaSearch, setAreaSearch] = useState('');
    const [showAreaResults, setShowAreaResults] = useState(false);
    const [houseDetails, setHouseDetails] = useState('');

    // Reset fields when country/city changes
    useEffect(() => {
        setCity('');
        setArea('');
    }, [country]);

    useEffect(() => {
        setArea('');
        setAreaSearch('');
    }, [city]);

    // Reset all fields when modal opens to avoid carrying over previous selection
    useEffect(() => {
        if (isOpen) {
            setCity('');
            setArea('');
            setAreaSearch('');
            setHouseDetails('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const fullAddress = `${houseDetails ? houseDetails + ', ' : ''}${area ? area + ', ' : ''}${city}, ${country}`;
        onSelect(fullAddress);
        onClose();
    };

    if (!isOpen) return null;

    const countries = Object.keys(locationData);
    const cities = country ? Object.keys(locationData[country] || {}) : [];
    const areas = (country && city) ? (locationData[country][city] || []) : [];

    const filteredAreas = areas.filter(a =>
        a.toLowerCase().includes(areaSearch.toLowerCase())
    );

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className={styles.header}>
                        <h3>{title}</h3>
                        <button className={styles.closeBtn} onClick={onClose}><FiX size={20} /></button>
                    </div>

                    <div className={styles.body}>
                        <div className={styles.formGrid}>
                            {/* Country Selection */}
                            <div className={styles.fieldGroup}>
                                <label><FiGlobe /> Country</label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className={styles.selectInput}
                                >
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* City Selection */}
                            <div className={styles.fieldGroup}>
                                <label><FiNavigation /> Select City</label>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className={styles.selectInput}
                                    disabled={!country}
                                >
                                    <option value="" disabled>Choose City...</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Area Selection */}
                            <div className={styles.fieldGroup} style={{ position: 'relative' }}>
                                <label><FiMapPin /> Select Area / Tehsil</label>
                                {country === 'Pakistan' ? (
                                    <div className={styles.searchableWrapper}>
                                        <div className={styles.searchInputWrapper}>
                                            <FiSearch className={styles.searchIcon} size={14} />
                                            <input
                                                type="text"
                                                placeholder={city ? "Search area (e.g. D-Ground)..." : "Choose city first"}
                                                className={styles.searchableInput}
                                                value={areaSearch || area}
                                                onChange={(e) => {
                                                    setAreaSearch(e.target.value);
                                                    setShowAreaResults(true);
                                                }}
                                                onFocus={() => setShowAreaResults(true)}
                                                disabled={!city}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {showAreaResults && city && (
                                                <motion.ul
                                                    className={styles.resultsList}
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                >
                                                    {filteredAreas.length > 0 ? (
                                                        filteredAreas.map(a => (
                                                            <li key={a} onClick={() => {
                                                                setArea(a);
                                                                setAreaSearch(a);
                                                                setShowAreaResults(false);
                                                            }}>
                                                                {a}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className={styles.noResult}>No area found</li>
                                                    )}
                                                    <li className={styles.otherArea} onClick={() => {
                                                        setArea(areaSearch);
                                                        setShowAreaResults(false);
                                                    }}>
                                                        Use "{areaSearch}" as area
                                                    </li>
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        placeholder="Enter Area/Zone Name"
                                        className={styles.textInput}
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        disabled={!city}
                                    />
                                )}
                            </div>

                            {/* House/Street Details */}
                            <div className={styles.fieldGroup}>
                                <label><FiInfo /> Street / House / Building</label>
                                <textarea
                                    placeholder="Enter complete house number, street name, or landmark..."
                                    className={styles.textArea}
                                    rows={3}
                                    value={houseDetails}
                                    onChange={(e) => setHouseDetails(e.target.value)}
                                    disabled={!city}
                                />
                            </div>
                        </div>

                        {/* Preview */}
                        <div className={styles.addressPreview}>
                            <strong>Address Preview:</strong>
                            <p>{(city) ? `${houseDetails ? houseDetails + ', ' : ''}${area ? area + ', ' : ''}${city}, ${country}` : 'Please complete the selection above'}</p>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button
                            className={styles.confirmBtn}
                            onClick={handleConfirm}
                            disabled={!city || (country === 'Pakistan' && !area)}
                        >
                            Confirm Address
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
