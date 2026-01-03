/**
 * TRANSPORT SERVICE
 * 
 * Purpose: Handles all transport-related API calls.
 * Theme-agnostic - only knows about API parameters.
 * 
 * In production, would integrate with:
 * - Rome2Rio API
 * - RentalCars API
 * - Uber/Lyft APIs
 */

import apiClient from '../utils/apiClient.js';

class TransportService {
  /**
   * Search for transport options
   * 
   * @param {Object} params - API-ready parameters from TransportParamsAdapter
   * @returns {Promise<Array>} List of transport options
   */
  async searchTransport(params) {
    try {
      // In production:
      // const response = await apiClient.get('https://api.rome2rio.com/api/1.4/json/Search', { params });
      // return response.data.routes;

      return this._getMockedTransport(params);
    } catch (error) {
      console.error('Error fetching transport:', error.message);
      throw new Error('Failed to fetch transport options');
    }
  }

  /**
   * Search for rental cars
   * 
   * @param {Object} params - API-ready parameters
   * @returns {Promise<Array>} List of rental car options
   */
  async searchRentalCars(params) {
    try {
      return this._getMockedRentalCars(params);
    } catch (error) {
      console.error('Error fetching rental cars:', error.message);
      throw new Error('Failed to fetch rental cars');
    }
  }

  /**
   * PRIVATE: Mocked data
   */
  _getMockedTransport(params) {
    const transportOptions = [
      {
        id: 'TRANSPORT_1',
        mode: 'taxi',
        name: 'Taxi',
        price: 45,
        duration: 25, // minutes
        distance: 15, // km
        provider: 'Local Taxi Service',
        available: true,
      },
      {
        id: 'TRANSPORT_2',
        mode: 'public_transport',
        name: 'Bus + Metro',
        price: 5,
        duration: 45,
        distance: 15,
        provider: 'City Transit',
        available: true,
        transfers: 1,
      },
      {
        id: 'TRANSPORT_3',
        mode: 'private_car',
        name: 'Private Car',
        price: 75,
        duration: 25,
        distance: 15,
        provider: 'Premium Rides',
        available: true,
      },
      {
        id: 'TRANSPORT_4',
        mode: 'walk',
        name: 'Walking',
        price: 0,
        duration: 180, // 3 hours
        distance: 12,
        provider: 'On foot',
        available: true,
      },
    ];

    return transportOptions;
  }

  _getMockedRentalCars(params) {
    const rentalCars = [];
    const categories = ['ECONOMY', 'COMPACT', 'STANDARD', 'SUV', 'LUXURY'];
    
    for (let i = 0; i < 5; i++) {
      const category = params.vehicleCategory || categories[i];
      
      rentalCars.push({
        id: `CAR_${i + 1}`,
        category,
        make: this._getCarMake(category),
        model: this._getCarModel(category),
        price: this._getCarPrice(category),
        currency: params.currency || 'USD',
        features: {
          seats: category === 'SUV' ? 7 : 5,
          doors: 4,
          transmission: params.automaticTransmission ? 'Automatic' : 'Manual',
          airConditioned: params.airConditioned !== false,
          fuelType: 'Gasoline',
        },
        supplier: this._getCarSupplier(),
        available: true,
        image_url: `https://via.placeholder.com/400x300?text=${category}+Car`,
      });
    }

    return rentalCars;
  }

  _getCarMake(category) {
    const makes = {
      'ECONOMY': ['Toyota', 'Honda', 'Hyundai'],
      'COMPACT': ['Volkswagen', 'Mazda', 'Ford'],
      'STANDARD': ['Toyota', 'Honda', 'Nissan'],
      'SUV': ['Jeep', 'Toyota', 'Ford'],
      'LUXURY': ['BMW', 'Mercedes-Benz', 'Audi'],
    };
    const options = makes[category] || makes['STANDARD'];
    return options[Math.floor(Math.random() * options.length)];
  }

  _getCarModel(category) {
    const models = {
      'ECONOMY': ['Corolla', 'Civic', 'Elantra'],
      'COMPACT': ['Golf', 'Mazda3', 'Focus'],
      'STANDARD': ['Camry', 'Accord', 'Altima'],
      'SUV': ['Wrangler', 'RAV4', 'Explorer'],
      'LUXURY': ['5 Series', 'E-Class', 'A6'],
    };
    const options = models[category] || models['STANDARD'];
    return options[Math.floor(Math.random() * options.length)];
  }

  _getCarPrice(category) {
    const prices = {
      'ECONOMY': 35,
      'COMPACT': 45,
      'STANDARD': 60,
      'SUV': 85,
      'LUXURY': 150,
    };
    return prices[category] || 50;
  }

  _getCarSupplier() {
    const suppliers = ['Hertz', 'Enterprise', 'Avis', 'Budget', 'National'];
    return suppliers[Math.floor(Math.random() * suppliers.length)];
  }
}

export default new TransportService();
