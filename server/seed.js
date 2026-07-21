require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected!');

  await User.deleteMany({ role: 'restaurant' });
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});
  console.log('Purana data saaf hua!');

  const password = await bcrypt.hash('123456', 12);

  const owners = await User.insertMany([
    { name: 'Sharma Ji', email: 'owner1@food.com', password, role: 'restaurant', phone: '9876543210' },
    { name: 'Chen Bhai', email: 'owner2@food.com', password, role: 'restaurant', phone: '9876543211' },
    { name: 'Mithai Wale', email: 'owner3@food.com', password, role: 'restaurant', phone: '9876543212' },
    { name: 'Fast Food King', email: 'owner4@food.com', password, role: 'restaurant', phone: '9876543213' },
    { name: 'South Spice', email: 'owner5@food.com', password, role: 'restaurant', phone: '9876543214' },
    { name: 'Mughal Kitchen', email: 'owner6@food.com', password, role: 'restaurant', phone: '9876543215' },
    { name: 'Punjab Da Dhaba', email: 'owner7@food.com', password, role: 'restaurant', phone: '9876543216' },
    { name: 'Bengali Sweets', email: 'owner8@food.com', password, role: 'restaurant', phone: '9876543217' },
    { name: 'Mexican Fiesta', email: 'owner9@food.com', password, role: 'restaurant', phone: '9876543218' },
    { name: 'Healthy Bites', email: 'owner10@food.com', password, role: 'restaurant', phone: '9876543219' },
    { name: 'Sea Food Palace', email: 'owner11@food.com', password, role: 'restaurant', phone: '9876543220' },
    { name: 'Rajasthani Rasoi', email: 'owner12@food.com', password, role: 'restaurant', phone: '9876543221' },
    { name: 'Continental Chef', email: 'owner13@food.com', password, role: 'restaurant', phone: '9876543222' },
    { name: 'Chai Nashta', email: 'owner14@food.com', password, role: 'restaurant', phone: '9876543223' },
    { name: 'Ice Cream World', email: 'owner15@food.com', password, role: 'restaurant', phone: '9876543224' },
    { name: 'Biryani House', email: 'owner16@food.com', password, role: 'restaurant', phone: '9876543225' },
    { name: 'Taco Town', email: 'owner17@food.com', password, role: 'restaurant', phone: '9876543226' },
    { name: 'Grill Station', email: 'owner18@food.com', password, role: 'restaurant', phone: '9876543227' },
    { name: 'Juice Junction', email: 'owner19@food.com', password, role: 'restaurant', phone: '9876543228' },
  ]);

  const restaurants = await Restaurant.insertMany([
    { owner: owners[0]._id, name: 'Sharma Ji Ka Dhaba', description: 'Authentic Indian home style food', cuisine: ['Indian', 'North Indian', 'Punjabi'], address: { street: 'Sadar Bazar', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.7064, 28.9845] }, phone: '9876543210', rating: 4.5, totalRatings: 234, isOpen: true, deliveryTime: '30-40 mins', minOrder: 149 },
    { owner: owners[1]._id, name: 'Dragon Chinese Corner', description: 'Best Chinese & Indo-Chinese food', cuisine: ['Chinese', 'Indo-Chinese', 'Asian'], address: { street: 'Begum Bridge', city: 'Meerut', pincode: '250002' }, location: { type: 'Point', coordinates: [77.7100, 28.9900] }, phone: '9876543211', rating: 4.2, totalRatings: 189, isOpen: true, deliveryTime: '25-35 mins', minOrder: 199 },
    { owner: owners[2]._id, name: 'Shyam Sweets & Fruits', description: 'Fresh sweets, fruits & healthy options', cuisine: ['Sweets', 'Fruits', 'Healthy', 'Desserts'], address: { street: 'Hapur Road', city: 'Meerut', pincode: '250003' }, location: { type: 'Point', coordinates: [77.7150, 28.9800] }, phone: '9876543212', rating: 4.7, totalRatings: 312, isOpen: true, deliveryTime: '20-30 mins', minOrder: 99 },
    { owner: owners[3]._id, name: 'Burger Bros Fast Food', description: 'Burgers, pizza, fries & more', cuisine: ['Fast Food', 'Burgers', 'Pizza', 'Snacks'], address: { street: 'Mawana Road', city: 'Meerut', pincode: '250004' }, location: { type: 'Point', coordinates: [77.7200, 28.9750] }, phone: '9876543213', rating: 4.0, totalRatings: 156, isOpen: true, deliveryTime: '20-30 mins', minOrder: 129 },
    { owner: owners[4]._id, name: 'South Spice Restaurant', description: 'Authentic South Indian cuisine', cuisine: ['South Indian', 'Dosa', 'Idli', 'Kerala'], address: { street: 'Shastri Nagar', city: 'Meerut', pincode: '250005' }, location: { type: 'Point', coordinates: [77.7080, 28.9820] }, phone: '9876543214', rating: 4.3, totalRatings: 198, isOpen: true, deliveryTime: '25-35 mins', minOrder: 149 },
    { owner: owners[5]._id, name: 'Mughal Kitchen', description: 'Royal Mughlai cuisine', cuisine: ['Mughlai', 'Kebabs', 'Biryani', 'Non-Veg'], address: { street: 'Civil Lines', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.7030, 28.9870] }, phone: '9876543215', rating: 4.6, totalRatings: 287, isOpen: true, deliveryTime: '35-45 mins', minOrder: 249 },
    { owner: owners[6]._id, name: 'Punjab Da Dhaba', description: 'Authentic Punjabi flavors', cuisine: ['Punjabi', 'Lassi', 'Paratha', 'Indian'], address: { street: 'Kanker Khera', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.6990, 28.9910] }, phone: '9876543216', rating: 4.4, totalRatings: 223, isOpen: true, deliveryTime: '30-40 mins', minOrder: 179 },
    { owner: owners[7]._id, name: 'Bengali Sweets Corner', description: 'Authentic Bengali sweets & snacks', cuisine: ['Bengali', 'Sweets', 'Snacks'], address: { street: 'Brahmpuri', city: 'Meerut', pincode: '250002' }, location: { type: 'Point', coordinates: [77.7120, 28.9830] }, phone: '9876543217', rating: 4.5, totalRatings: 176, isOpen: true, deliveryTime: '20-30 mins', minOrder: 99 },
    { owner: owners[8]._id, name: 'Mexican Fiesta', description: 'Tacos, burritos & Mexican delights', cuisine: ['Mexican', 'Continental', 'Fast Food'], address: { street: 'Gandhi Nagar', city: 'Meerut', pincode: '250004' }, location: { type: 'Point', coordinates: [77.7180, 28.9760] }, phone: '9876543218', rating: 3.9, totalRatings: 134, isOpen: true, deliveryTime: '25-35 mins', minOrder: 199 },
    { owner: owners[9]._id, name: 'Healthy Bites', description: 'Nutritious & delicious healthy food', cuisine: ['Healthy', 'Salads', 'Juices', 'Vegan'], address: { street: 'Panchvati Colony', city: 'Meerut', pincode: '250003' }, location: { type: 'Point', coordinates: [77.7050, 28.9800] }, phone: '9876543219', rating: 4.1, totalRatings: 145, isOpen: true, deliveryTime: '20-30 mins', minOrder: 149 },
    { owner: owners[10]._id, name: 'Sea Food Palace', description: 'Fresh seafood & fish dishes', cuisine: ['Seafood', 'Fish', 'Coastal', 'Non-Veg'], address: { street: 'Lisari Gate', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.7010, 28.9850] }, phone: '9876543220', rating: 4.3, totalRatings: 167, isOpen: true, deliveryTime: '30-40 mins', minOrder: 299 },
    { owner: owners[11]._id, name: 'Rajasthani Rasoi', description: 'Dal Baati Churma & more', cuisine: ['Rajasthani', 'Indian', 'Veg'], address: { street: 'Pallavpuram', city: 'Meerut', pincode: '250005' }, location: { type: 'Point', coordinates: [77.7160, 28.9810] }, phone: '9876543221', rating: 4.4, totalRatings: 201, isOpen: true, deliveryTime: '30-40 mins', minOrder: 199 },
    { owner: owners[12]._id, name: 'Continental Cafe', description: 'Western & continental cuisine', cuisine: ['Continental', 'Italian', 'Pasta', 'Cafe'], address: { street: 'Garh Road', city: 'Meerut', pincode: '250004' }, location: { type: 'Point', coordinates: [77.7190, 28.9740] }, phone: '9876543222', rating: 4.0, totalRatings: 123, isOpen: true, deliveryTime: '25-35 mins', minOrder: 249 },
    { owner: owners[13]._id, name: 'Chai Nashta Corner', description: 'Tea, snacks & breakfast', cuisine: ['Breakfast', 'Chai', 'Snacks', 'Indian'], address: { street: 'Suraj Kund', city: 'Meerut', pincode: '250002' }, location: { type: 'Point', coordinates: [77.7090, 28.9890] }, phone: '9876543223', rating: 4.2, totalRatings: 289, isOpen: true, deliveryTime: '15-25 mins', minOrder: 49 },
    { owner: owners[14]._id, name: 'Ice Cream World', description: 'Ice creams, sundaes & cold desserts', cuisine: ['Ice Cream', 'Desserts', 'Cold Drinks'], address: { street: 'Nauchandi Ground', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.7070, 28.9860] }, phone: '9876543224', rating: 4.6, totalRatings: 342, isOpen: true, deliveryTime: '15-25 mins', minOrder: 79 },
    { owner: owners[15]._id, name: 'Biryani House', description: 'Best biryani in Meerut', cuisine: ['Biryani', 'Mughlai', 'North Indian'], address: { street: 'Abu Lane', city: 'Meerut', pincode: '250002' }, location: { type: 'Point', coordinates: [77.7110, 28.9880] }, phone: '9876543225', rating: 4.7, totalRatings: 456, isOpen: true, deliveryTime: '30-40 mins', minOrder: 199 },
    { owner: owners[16]._id, name: 'Grill & Barbeque Station', description: 'Grills, BBQ & tandoor specialties', cuisine: ['BBQ', 'Grills', 'Tandoor', 'Non-Veg'], address: { street: 'Modipuram', city: 'Meerut', pincode: '250110' }, location: { type: 'Point', coordinates: [77.7230, 28.9720] }, phone: '9876543227', rating: 4.3, totalRatings: 178, isOpen: true, deliveryTime: '35-45 mins', minOrder: 299 },
    { owner: owners[17]._id, name: 'Fresh Juice Junction', description: 'Fresh juices, smoothies & shakes', cuisine: ['Juices', 'Smoothies', 'Healthy', 'Drinks'], address: { street: 'Medical Road', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.7040, 28.9840] }, phone: '9876543228', rating: 4.4, totalRatings: 267, isOpen: true, deliveryTime: '15-20 mins', minOrder: 69 },
    { owner: owners[18]._id, name: 'Street Food Hub', description: 'Gol Gappa, Chaat & street delights', cuisine: ['Street Food', 'Chaat', 'Snacks', 'Indian'], address: { street: 'Victoria Park', city: 'Meerut', pincode: '250001' }, location: { type: 'Point', coordinates: [77.7055, 28.9855] }, phone: '9876543229', rating: 4.5, totalRatings: 389, isOpen: true, deliveryTime: '20-30 mins', minOrder: 59 },
  ]);

  console.log(`✅ ${restaurants.length} Restaurants bane!`);

  const menuItems = [
    // SHARMA JI KA DHABA
    { restaurant: restaurants[0]._id, name: 'Dal Makhani', description: 'Slow cooked black lentils with butter & cream', price: 199, category: 'Indian Veg', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Paneer Butter Masala', description: 'Soft paneer in rich tomato gravy', price: 249, category: 'Indian Veg', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Palak Paneer', description: 'Fresh spinach with cottage cheese', price: 229, category: 'Indian Veg', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Aloo Gobi', description: 'Potato & cauliflower sabzi', price: 149, category: 'Indian Veg', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Chana Masala', description: 'Spicy chickpea curry', price: 169, category: 'Indian Veg', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Butter Chicken', description: 'Creamy tomato chicken curry', price: 299, category: 'Indian Non-Veg', isVeg: false },
    { restaurant: restaurants[0]._id, name: 'Mutton Rogan Josh', description: 'Kashmiri style mutton curry', price: 349, category: 'Indian Non-Veg', isVeg: false },
    { restaurant: restaurants[0]._id, name: 'Chicken Biryani', description: 'Fragrant basmati rice with chicken', price: 319, category: 'Indian Non-Veg', isVeg: false },
    { restaurant: restaurants[0]._id, name: 'Butter Naan', description: 'Soft tandoori bread with butter', price: 49, category: 'Breads', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Jeera Rice', description: 'Basmati rice with cumin', price: 129, category: 'Breads', isVeg: true },
    { restaurant: restaurants[0]._id, name: 'Veg Biryani', description: 'Fragrant rice with vegetables', price: 249, category: 'Breads', isVeg: true },

    // DRAGON CHINESE CORNER
    { restaurant: restaurants[1]._id, name: 'Veg Fried Rice', description: 'Wok tossed rice with vegetables', price: 179, category: 'Chinese Veg', isVeg: true },
    { restaurant: restaurants[1]._id, name: 'Veg Hakka Noodles', description: 'Stir fried noodles with veggies', price: 169, category: 'Chinese Veg', isVeg: true },
    { restaurant: restaurants[1]._id, name: 'Veg Manchurian', description: 'Crispy veg balls in spicy sauce', price: 189, category: 'Chinese Veg', isVeg: true },
    { restaurant: restaurants[1]._id, name: 'Paneer Chilli', description: 'Cottage cheese in Indo-Chinese sauce', price: 229, category: 'Chinese Veg', isVeg: true },
    { restaurant: restaurants[1]._id, name: 'Veg Momos', description: '8 pcs steamed veg dumplings', price: 149, category: 'Chinese Veg', isVeg: true },
    { restaurant: restaurants[1]._id, name: 'Mushroom Manchurian', description: 'Mushrooms in tangy sauce', price: 209, category: 'Chinese Veg', isVeg: true },
    { restaurant: restaurants[1]._id, name: 'Chicken Fried Rice', description: 'Classic chicken fried rice', price: 219, category: 'Chinese Non-Veg', isVeg: false },
    { restaurant: restaurants[1]._id, name: 'Chicken Manchurian', description: 'Crispy chicken in spicy sauce', price: 249, category: 'Chinese Non-Veg', isVeg: false },
    { restaurant: restaurants[1]._id, name: 'Chilli Chicken', description: 'Spicy Indo-Chinese chicken', price: 259, category: 'Chinese Non-Veg', isVeg: false },
    { restaurant: restaurants[1]._id, name: 'Chicken Momos', description: '8 pcs steamed chicken dumplings', price: 179, category: 'Chinese Non-Veg', isVeg: false },
    { restaurant: restaurants[1]._id, name: 'Prawn Fried Rice', description: 'Rice with juicy prawns', price: 299, category: 'Chinese Non-Veg', isVeg: false },

    // SHYAM SWEETS & FRUITS
    { restaurant: restaurants[2]._id, name: 'Gulab Jamun', description: 'Soft khoya balls in sugar syrup (4 pcs)', price: 99, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Rasgulla', description: 'Soft cottage cheese balls (4 pcs)', price: 89, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Jalebi', description: 'Crispy spiral sweets (250g)', price: 79, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Ladoo', description: 'Traditional besan ladoo (4 pcs)', price: 99, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Barfi', description: 'Milk based sweet (250g)', price: 149, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Rasmalai', description: 'Soft paneer in flavored milk (3 pcs)', price: 139, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Fresh Fruit Bowl', description: 'Seasonal mixed fruits', price: 149, category: 'Fruits', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Watermelon Slice', description: 'Fresh chilled watermelon', price: 79, category: 'Fruits', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Mango Shake', description: 'Fresh Alphonso mango milkshake', price: 129, category: 'Fruits', isVeg: true },
    { restaurant: restaurants[2]._id, name: 'Fruit Chaat', description: 'Spicy fruit salad with masala', price: 129, category: 'Fruits', isVeg: true },

    // BURGER BROS
    { restaurant: restaurants[3]._id, name: 'Veg Burger', description: 'Crispy aloo patty with fresh veggies', price: 149, category: 'Burgers', isVeg: true },
    { restaurant: restaurants[3]._id, name: 'Chicken Burger', description: 'Juicy chicken patty burger', price: 199, category: 'Burgers', isVeg: false },
    { restaurant: restaurants[3]._id, name: 'Double Chicken Burger', description: 'Double patty loaded burger', price: 269, category: 'Burgers', isVeg: false },
    { restaurant: restaurants[3]._id, name: 'Margherita Pizza', description: 'Classic tomato & mozzarella', price: 249, category: 'Pizza', isVeg: true },
    { restaurant: restaurants[3]._id, name: 'Chicken BBQ Pizza', description: 'BBQ chicken with onions', price: 349, category: 'Pizza', isVeg: false },
    { restaurant: restaurants[3]._id, name: 'French Fries', description: 'Crispy golden fries with dip', price: 99, category: 'Snacks', isVeg: true },
    { restaurant: restaurants[3]._id, name: 'Chicken Nuggets', description: '6 pcs crispy chicken nuggets', price: 179, category: 'Snacks', isVeg: false },
    { restaurant: restaurants[3]._id, name: 'Cold Coffee', description: 'Chilled blended coffee', price: 99, category: 'Drinks', isVeg: true },

    // SOUTH SPICE
    { restaurant: restaurants[4]._id, name: 'Masala Dosa', description: 'Crispy dosa with potato filling', price: 129, category: 'Dosa', isVeg: true },
    { restaurant: restaurants[4]._id, name: 'Plain Dosa', description: 'Crispy rice crepe with sambar', price: 99, category: 'Dosa', isVeg: true },
    { restaurant: restaurants[4]._id, name: 'Idli Sambar', description: '4 soft idlis with sambar & chutney', price: 99, category: 'Breakfast', isVeg: true },
    { restaurant: restaurants[4]._id, name: 'Vada Sambar', description: '2 medu vada with sambar', price: 89, category: 'Breakfast', isVeg: true },
    { restaurant: restaurants[4]._id, name: 'Chicken Chettinad', description: 'Spicy South Indian chicken curry', price: 299, category: 'South Non-Veg', isVeg: false },
    { restaurant: restaurants[4]._id, name: 'Fish Fry', description: 'Crispy South Indian style fish', price: 279, category: 'South Non-Veg', isVeg: false },
    { restaurant: restaurants[4]._id, name: 'Rasam', description: 'Tangy tomato soup', price: 69, category: 'Soups', isVeg: true },
    { restaurant: restaurants[4]._id, name: 'Coconut Chutney', description: 'Fresh coconut chutney', price: 39, category: 'Extras', isVeg: true },

    // MUGHAL KITCHEN
    { restaurant: restaurants[5]._id, name: 'Seekh Kebab', description: 'Minced meat skewers from tandoor', price: 299, category: 'Kebabs', isVeg: false },
    { restaurant: restaurants[5]._id, name: 'Paneer Tikka', description: 'Grilled marinated cottage cheese', price: 269, category: 'Kebabs', isVeg: true },
    { restaurant: restaurants[5]._id, name: 'Chicken Tikka', description: 'Juicy tandoori chicken pieces', price: 299, category: 'Kebabs', isVeg: false },
    { restaurant: restaurants[5]._id, name: 'Mutton Biryani', description: 'Slow cooked mutton biryani', price: 399, category: 'Biryani', isVeg: false },
    { restaurant: restaurants[5]._id, name: 'Chicken Biryani', description: 'Aromatic chicken dum biryani', price: 329, category: 'Biryani', isVeg: false },
    { restaurant: restaurants[5]._id, name: 'Nihari', description: 'Slow cooked mutton stew', price: 349, category: 'Curries', isVeg: false },
    { restaurant: restaurants[5]._id, name: 'Shahi Korma', description: 'Rich cashew & cream gravy chicken', price: 319, category: 'Curries', isVeg: false },

    // PUNJAB DA DHABA
    { restaurant: restaurants[6]._id, name: 'Aloo Paratha', description: 'Stuffed potato flatbread with butter', price: 89, category: 'Paratha', isVeg: true },
    { restaurant: restaurants[6]._id, name: 'Gobi Paratha', description: 'Cauliflower stuffed flatbread', price: 89, category: 'Paratha', isVeg: true },
    { restaurant: restaurants[6]._id, name: 'Paneer Paratha', description: 'Cottage cheese flatbread', price: 109, category: 'Paratha', isVeg: true },
    { restaurant: restaurants[6]._id, name: 'Sweet Lassi', description: 'Chilled sweet yogurt drink (500ml)', price: 79, category: 'Drinks', isVeg: true },
    { restaurant: restaurants[6]._id, name: 'Salted Lassi', description: 'Refreshing salted yogurt drink', price: 69, category: 'Drinks', isVeg: true },
    { restaurant: restaurants[6]._id, name: 'Sarson Ka Saag', description: 'Mustard greens with makki roti', price: 199, category: 'Specials', isVeg: true },
    { restaurant: restaurants[6]._id, name: 'Makki Ki Roti', description: 'Maize flatbread', price: 49, category: 'Breads', isVeg: true },

    // BENGALI SWEETS
    { restaurant: restaurants[7]._id, name: 'Mishti Doi', description: 'Sweet Bengali curd', price: 79, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[7]._id, name: 'Sandesh', description: 'Fresh cottage cheese sweet', price: 99, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[7]._id, name: 'Chomchom', description: 'Cylindrical milk sweet', price: 89, category: 'Sweets', isVeg: true },
    { restaurant: restaurants[7]._id, name: 'Kachori', description: 'Crispy fried bread with filling', price: 49, category: 'Snacks', isVeg: true },
    { restaurant: restaurants[7]._id, name: 'Singhara', description: 'Crispy triangular pastry', price: 39, category: 'Snacks', isVeg: true },

    // MEXICAN FIESTA
    { restaurant: restaurants[8]._id, name: 'Veg Tacos', description: 'Soft tacos with bean filling', price: 199, category: 'Tacos', isVeg: true },
    { restaurant: restaurants[8]._id, name: 'Chicken Tacos', description: 'Spicy chicken in soft tacos', price: 249, category: 'Tacos', isVeg: false },
    { restaurant: restaurants[8]._id, name: 'Veg Burrito', description: 'Wrapped tortilla with rice & beans', price: 229, category: 'Burritos', isVeg: true },
    { restaurant: restaurants[8]._id, name: 'Chicken Burrito', description: 'Grilled chicken burrito', price: 279, category: 'Burritos', isVeg: false },
    { restaurant: restaurants[8]._id, name: 'Nachos', description: 'Crispy chips with salsa & cheese', price: 199, category: 'Snacks', isVeg: true },

    // HEALTHY BITES
    { restaurant: restaurants[9]._id, name: 'Garden Salad', description: 'Fresh greens with olive oil dressing', price: 179, category: 'Salads', isVeg: true },
    { restaurant: restaurants[9]._id, name: 'Caesar Salad', description: 'Romaine lettuce with caesar dressing', price: 199, category: 'Salads', isVeg: true },
    { restaurant: restaurants[9]._id, name: 'Quinoa Bowl', description: 'Protein rich quinoa with veggies', price: 249, category: 'Bowls', isVeg: true },
    { restaurant: restaurants[9]._id, name: 'Avocado Toast', description: 'Multigrain toast with avocado', price: 229, category: 'Breakfast', isVeg: true },
    { restaurant: restaurants[9]._id, name: 'Green Smoothie', description: 'Spinach, banana & almond milk', price: 179, category: 'Drinks', isVeg: true },
    { restaurant: restaurants[9]._id, name: 'Protein Shake', description: 'High protein chocolate shake', price: 199, category: 'Drinks', isVeg: true },

    // SEA FOOD PALACE
    { restaurant: restaurants[10]._id, name: 'Prawn Masala', description: 'Juicy prawns in spicy gravy', price: 399, category: 'Prawns', isVeg: false },
    { restaurant: restaurants[10]._id, name: 'Grilled Fish', description: 'Fresh fish grilled with herbs', price: 349, category: 'Fish', isVeg: false },
    { restaurant: restaurants[10]._id, name: 'Fish Curry', description: 'Coastal style fish curry', price: 329, category: 'Fish', isVeg: false },
    { restaurant: restaurants[10]._id, name: 'Crab Masala', description: 'Spicy crab in thick gravy', price: 499, category: 'Crab', isVeg: false },
    { restaurant: restaurants[10]._id, name: 'Prawn Fried Rice', description: 'Wok tossed rice with prawns', price: 299, category: 'Rice', isVeg: false },

    // RAJASTHANI RASOI
    { restaurant: restaurants[11]._id, name: 'Dal Baati Churma', description: 'Traditional Rajasthani platter', price: 299, category: 'Thali', isVeg: true },
    { restaurant: restaurants[11]._id, name: 'Gatte Ki Sabzi', description: 'Gram flour dumplings in gravy', price: 179, category: 'Sabzi', isVeg: true },
    { restaurant: restaurants[11]._id, name: 'Ker Sangri', description: 'Desert beans & berries sabzi', price: 199, category: 'Sabzi', isVeg: true },
    { restaurant: restaurants[11]._id, name: 'Laal Maas', description: 'Spicy red mutton curry', price: 379, category: 'Non-Veg', isVeg: false },
    { restaurant: restaurants[11]._id, name: 'Ghevar', description: 'Traditional Rajasthani sweet', price: 149, category: 'Sweets', isVeg: true },

    // CONTINENTAL CAFE
    { restaurant: restaurants[12]._id, name: 'Pasta Arrabiata', description: 'Penne in spicy tomato sauce', price: 249, category: 'Pasta', isVeg: true },
    { restaurant: restaurants[12]._id, name: 'Chicken Pasta', description: 'Creamy white sauce pasta with chicken', price: 299, category: 'Pasta', isVeg: false },
    { restaurant: restaurants[12]._id, name: 'Mushroom Soup', description: 'Creamy mushroom soup', price: 149, category: 'Soups', isVeg: true },
    { restaurant: restaurants[12]._id, name: 'Grilled Sandwich', description: 'Toasted sandwich with veggies', price: 179, category: 'Sandwiches', isVeg: true },
    { restaurant: restaurants[12]._id, name: 'Cappuccino', description: 'Rich espresso with steamed milk', price: 129, category: 'Beverages', isVeg: true },

    // CHAI NASHTA CORNER
    { restaurant: restaurants[13]._id, name: 'Masala Chai', description: 'Spiced Indian tea (2 cups)', price: 49, category: 'Chai', isVeg: true },
    { restaurant: restaurants[13]._id, name: 'Cutting Chai', description: 'Small strong tea', price: 25, category: 'Chai', isVeg: true },
    { restaurant: restaurants[13]._id, name: 'Poha', description: 'Flattened rice with onions & spices', price: 69, category: 'Breakfast', isVeg: true },
    { restaurant: restaurants[13]._id, name: 'Upma', description: 'Semolina breakfast dish', price: 69, category: 'Breakfast', isVeg: true },
    { restaurant: restaurants[13]._id, name: 'Bread Pakora', description: 'Fried bread fritters', price: 79, category: 'Snacks', isVeg: true },
    { restaurant: restaurants[13]._id, name: 'Samosa', description: 'Crispy potato filled pastry (2 pcs)', price: 49, category: 'Snacks', isVeg: true },
    { restaurant: restaurants[13]._id, name: 'Bun Maska', description: 'Soft bun with butter', price: 39, category: 'Breakfast', isVeg: true },

    // ICE CREAM WORLD
    { restaurant: restaurants[14]._id, name: 'Vanilla Scoop', description: 'Classic vanilla ice cream (2 scoops)', price: 79, category: 'Ice Cream', isVeg: true },
    { restaurant: restaurants[14]._id, name: 'Chocolate Scoop', description: 'Rich chocolate ice cream (2 scoops)', price: 89, category: 'Ice Cream', isVeg: true },
    { restaurant: restaurants[14]._id, name: 'Mango Sundae', description: 'Mango ice cream with toppings', price: 129, category: 'Sundaes', isVeg: true },
    { restaurant: restaurants[14]._id, name: 'Chocolate Sundae', description: 'Chocolate ice cream with fudge', price: 139, category: 'Sundaes', isVeg: true },
    { restaurant: restaurants[14]._id, name: 'Kulfi', description: 'Traditional Indian ice cream', price: 79, category: 'Indian Desserts', isVeg: true },
    { restaurant: restaurants[14]._id, name: 'Falooda', description: 'Rose milk with vermicelli & basil seeds', price: 119, category: 'Indian Desserts', isVeg: true },

    // BIRYANI HOUSE
    { restaurant: restaurants[15]._id, name: 'Chicken Biryani', description: 'Aromatic dum biryani with chicken', price: 299, category: 'Biryani', isVeg: false },
    { restaurant: restaurants[15]._id, name: 'Mutton Biryani', description: 'Tender mutton dum biryani', price: 379, category: 'Biryani', isVeg: false },
    { restaurant: restaurants[15]._id, name: 'Veg Biryani', description: 'Fragrant vegetable biryani', price: 229, category: 'Biryani', isVeg: true },
    { restaurant: restaurants[15]._id, name: 'Egg Biryani', description: 'Biryani with boiled eggs', price: 249, category: 'Biryani', isVeg: false },
    { restaurant: restaurants[15]._id, name: 'Prawn Biryani', description: 'Biryani with juicy prawns', price: 399, category: 'Biryani', isVeg: false },
    { restaurant: restaurants[15]._id, name: 'Raita', description: 'Yogurt with cucumber & spices', price: 59, category: 'Sides', isVeg: true },
    { restaurant: restaurants[15]._id, name: 'Mirchi Ka Salan', description: 'Spicy chilli gravy for biryani', price: 79, category: 'Sides', isVeg: true },

    // GRILL & BARBEQUE
    { restaurant: restaurants[16]._id, name: 'BBQ Chicken Platter', description: 'Half chicken BBQ with sides', price: 449, category: 'BBQ', isVeg: false },
    { restaurant: restaurants[16]._id, name: 'Mutton Seekh Kebab', description: '4 pcs minced mutton skewers', price: 349, category: 'Kebabs', isVeg: false },
    { restaurant: restaurants[16]._id, name: 'Paneer Tikka Platter', description: 'Grilled paneer with mint chutney', price: 299, category: 'Veg Grills', isVeg: true },
    { restaurant: restaurants[16]._id, name: 'Fish Tikka', description: 'Marinated fish grilled in tandoor', price: 329, category: 'Seafood Grills', isVeg: false },
    { restaurant: restaurants[16]._id, name: 'Corn on the Cob', description: 'Grilled sweet corn with butter', price: 99, category: 'Veg Grills', isVeg: true },

    // FRESH JUICE JUNCTION
    { restaurant: restaurants[17]._id, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 99, category: 'Fresh Juices', isVeg: true },
    { restaurant: restaurants[17]._id, name: 'Watermelon Juice', description: 'Chilled watermelon juice', price: 79, category: 'Fresh Juices', isVeg: true },
    { restaurant: restaurants[17]._id, name: 'Mixed Fruit Juice', description: 'Blend of seasonal fruits', price: 119, category: 'Fresh Juices', isVeg: true },
    { restaurant: restaurants[17]._id, name: 'Mango Lassi', description: 'Thick mango yogurt drink', price: 129, category: 'Lassi', isVeg: true },
    { restaurant: restaurants[17]._id, name: 'Green Detox Juice', description: 'Spinach, cucumber & ginger', price: 149, category: 'Healthy', isVeg: true },
    { restaurant: restaurants[17]._id, name: 'Strawberry Smoothie', description: 'Fresh strawberry blended smoothie', price: 159, category: 'Smoothies', isVeg: true },

    // STREET FOOD HUB
    { restaurant: restaurants[18]._id, name: 'Gol Gappa', description: '6 pcs crispy puris with flavored water', price: 59, category: 'Chaat', isVeg: true },
    { restaurant: restaurants[18]._id, name: 'Dahi Puri', description: '6 pcs puris with curd & chutney', price: 79, category: 'Chaat', isVeg: true },
    { restaurant: restaurants[18]._id, name: 'Aloo Tikki Chaat', description: 'Crispy potato patty with chutneys', price: 89, category: 'Chaat', isVeg: true },
    { restaurant: restaurants[18]._id, name: 'Bhel Puri', description: 'Puffed rice with vegetables & chutney', price: 69, category: 'Chaat', isVeg: true },
    { restaurant: restaurants[18]._id, name: 'Pav Bhaji', description: 'Spicy mashed veggies with bread', price: 99, category: 'Street Food', isVeg: true },
    { restaurant: restaurants[18]._id, name: 'Chole Bhature', description: 'Spicy chickpeas with fried bread', price: 119, category: 'Street Food', isVeg: true },
    { restaurant: restaurants[18]._id, name: 'Raj Kachori', description: 'Large kachori with fillings', price: 89, category: 'Chaat', isVeg: true },
  ];

  await MenuItem.insertMany(menuItems);
  console.log(`✅ ${menuItems.length} Menu items add hue!`);
  console.log(`🎉 Seed complete! ${restaurants.length} restaurants, ${menuItems.length} items ready!`);
  process.exit(0);
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});