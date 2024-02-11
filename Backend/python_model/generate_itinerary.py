import json
import sys
import pymongo
import random
from bson.objectid import ObjectId
import copy

# MongoDB client initialization
client = pymongo.MongoClient("mongodb+srv://Yatra:Yatra@yatrasahayak.0gw5pwg.mongodb.net/?retryWrites=true&w=majority")

# MongoDB collections
attraction_db = client["Attractions"]
attractions_collection = attraction_db["attractions_in_mumbai"]
attractions_data = list(attractions_collection.find({}))

hotel_db = client["Hotels"]
hotels_collection = hotel_db["Hotels_in_Mumbai"]
hotels_data = list(hotels_collection.find({}))

restaurant_db = client["Restaurants"]
restaurants_collection = restaurant_db["restaurants_in_mumbai"]
restaurants_data = list(restaurants_collection.find({}))

bus_db = client["Buses"]
bus_collection = bus_db["buses"]
bus_data = list(bus_collection.find({}))

train_db = client["Trains"]
trains_collection = train_db["trains"]
trains_data = list(trains_collection.find({}))

flight_db = client["Flights"]
flights_collection = flight_db["flights"]
flights_data = list(flights_collection.find({}))

return_bus_db = client["Buses_return"]
return_bus_collection = return_bus_db["Buses_return"]
bus_data_return = list(return_bus_collection.find({}))

return_train_db = client["Trains_return"]
return_trains_collection = return_train_db["trains_return"]
trains_data_return = list(return_trains_collection.find({}))

return_flight_db = client["Flights_return"]
return_flights_collection = return_flight_db["flights_return"]
flights_data_return = list(return_flights_collection.find({}))


class TravelItineraryModel:
    def __init__(self, attractions_data, hotels_data, restaurants_data, bus_data, trains_data, flights_data,
                 bus_data_return, trains_data_return, flights_data_return):
        self.attractions_data = attractions_data
        self.hotels_data = hotels_data
        self.restaurants_data = restaurants_data
        self.bus_data = bus_data
        self.trains_data = trains_data
        self.flights_data = flights_data
        self.bus_data_return = bus_data_return
        self.trains_data_return = trains_data_return
        self.flights_data_return = flights_data_return

    def is_valid_numeric(self, value):
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False

    def generate_itinerary(self, num_travelers, start_location, destination, budget, date_of_departure, date_of_return, duration_of_stay, transportationType, preferences={}):
        # Initialize the itinerary
        itinerary = []

        # Choose the best transportation option for outward journey
        transportation_options = []
        if transportationType == 'bus':
            transportation_options = self.bus_data
            return_transportation_options = self.bus_data_return
        elif transportationType == 'train':
            transportation_options = self.trains_data
            return_transportation_options = self.trains_data_return
        elif transportationType == 'flight':
            transportation_options = self.flights_data
            return_transportation_options = self.flights_data_return

        # Filter outward transportation options based on budget and other criteria
        valid_transportation_options = []
        for option in transportation_options:
            if "price" in option and option["price"]:
                try:
                    price = float(option["price"])
                    if price <= budget and option.get("departure_date") == date_of_departure and option.get(
                            "departure") == start_location and option.get("destination") == destination:
                        valid_transportation_options.append(option)
                except ValueError:
                    print("Invalid 'price' value for transportation:", option["price"])

        # Choose a random outward transportation option from the valid ones
        if valid_transportation_options:
            outward_transportation = random.choice(valid_transportation_options)
        else:
            outward_transportation = None

        # Choose the best return_transportation option
        return_transportation = None
        for option in return_transportation_options:
            if "price" in option and option["price"]:
                try:
                    price = float(option["price"])
                    if price <= budget and option.get("departure_date") == date_of_return and option.get("departure") == destination and option.get("destination") == start_location:
                        return_transportation = option
                except ValueError:
                    print("Invalid 'price' value for return transportation:", option["price"])

        # Choose hotels within the budget
        hotels = []
        for hotel_option in self.hotels_data:
            if "price" in hotel_option and hotel_option["price"]:
                try:
                    # Convert to float
                    price = float(hotel_option["price"])
                    if price <= budget and hotel_option["checkin"] == date_of_departure:
                        hotels.append(hotel_option)
                except ValueError:
                    print("Invalid 'price' value for hotel:", hotel_option["price"])

        # Choose restaurants within the budget
        restaurants = []
        for restaurant_option in self.restaurants_data:
            if "price" in restaurant_option and restaurant_option["price"]:
                try:
                    price = float(restaurant_option["price"])
                    if price <= budget:
                        restaurants.append(restaurant_option)
                except ValueError:
                    print("Invalid 'price' value for restaurant:", restaurant_option["price"])

        # Choose attractions randomly without considering price
        attractions = random.sample(self.attractions_data, min(4 * duration_of_stay, len(self.attractions_data)))

        # Add the outward and return transportation, hotels, restaurants, and attractions to the itinerary
        itinerary.append(outward_transportation)
        itinerary.extend(random.sample(hotels, min(4 * duration_of_stay, len(hotels))))
        itinerary.extend(random.sample(restaurants, min(4 * duration_of_stay, len(restaurants))))
        itinerary.extend(attractions)
        itinerary.append(return_transportation)

        return itinerary



class GeneticAlgorithm:
    def __init__(self, model, data, population_size=10,
                 generations=20, crossover_probability=0.7, mutation_probability=0.1):
        self.model = model
        self.data = data
        self.population_size = population_size
        self.generations = generations
        self.crossover_probability = crossover_probability
        self.mutation_probability = mutation_probability
        self.budget = data['budget']

    def initialize_population(self):
        population = []
        for _ in range(self.population_size):
            itinerary = self.model.generate_itinerary(self.data['num_travelers'], self.data['start_location'],
                                                      self.data['destination'], self.data['budget'],
                                                      self.data['date_of_departure'], self.data['date_of_return'],
                                                      self.data['duration_of_stay'], self.data['transportationType'])
            population.append(itinerary)
        return population

    def calculate_fitness(self, itinerary):
        # Calculate the total cost of the itinerary
        total_cost_transportation = 0
        total_cost_return_transportation = 0
        total_cost_hotel = 0
        total_cost_food = 0

        max_hotel_price = 0  # Track the maximum price among hotels
        max_restaurant_price = 0  # Track the maximum price among restaurants

        for item in itinerary:
            if isinstance(item, dict) and 'price' in item:
                if item in self.model.bus_data + self.model.trains_data + self.model.flights_data:
                    total_cost_transportation += item['price'] * self.data["num_travelers"]
                elif item in self.model.hotels_data:
                    total_cost_hotel += item['price'] * self.data["num_travelers"] * self.data["duration_of_stay"]
                    # Update max_hotel_price if the current hotel price is higher
                    max_hotel_price = max(max_hotel_price, item['price'])
                elif item in self.model.bus_data_return + self.model.trains_data_return + self.model.flights_data_return:
                    total_cost_return_transportation += item['price']
                elif item in self.model.restaurants_data:
                    total_cost_food += item['price'] * self.data["num_travelers"]
                    # Update max_restaurant_price if the current restaurant price is higher
                    max_restaurant_price = max(max_restaurant_price, item['price'])

        # Use the maximum price among hotels or restaurants in the fitness calculation
        total_cost_hotel = max_hotel_price * self.data["num_travelers"] * self.data["duration_of_stay"]
        total_cost_food = max_restaurant_price * self.data["num_travelers"]

        total_cost_transportation_both = total_cost_transportation + total_cost_return_transportation
        # Calculate the total cost
        total_cost = total_cost_transportation_both + total_cost_hotel + total_cost_food

        # Calculate deviation from budget
        deviation = abs(total_cost - self.budget)
        # Penalize fitness based on deviation
        fitness = 1 / (1 + deviation)

        return fitness

    def crossover(self, parent1, parent2):
        # Randomly choose a crossover point
        crossover_point = random.randint(1, min(len(parent1), len(parent2)) - 1)

        # Create two children by swapping the genetic material of parents at the crossover point
        child1 = parent1[:crossover_point] + parent2[crossover_point:]
        child2 = parent2[:crossover_point] + parent1[crossover_point:]

        return child1, child2

    def mutate(self, itinerary):
        mutated_itinerary = copy.deepcopy(itinerary)

        # Randomly choose an item to mutate
        mutation_point = random.randint(0, len(mutated_itinerary) - 1)

        # Mutate the chosen item (replace it with a new randomly generated item)
        mutated_itinerary[mutation_point] = self.model.generate_itinerary(self.data['num_travelers'],
                                                                         self.data['start_location'],
                                                                         self.data['destination'],
                                                                         self.data['budget'],
                                                                         self.data['date_of_departure'],
                                                                         self.data['date_of_return'],
                                                                         self.data['duration_of_stay'],
                                                                         self.data['transportationType'])[
            mutation_point]

        return mutated_itinerary

    def select_parents(self, population):
        # Tournament selection: Randomly select two individuals, and choose the one with higher fitness
        parent1 = random.choice(population)
        parent2 = random.choice(population)

        if self.calculate_fitness(parent1) > self.calculate_fitness(parent2):
            return parent1
        else:
            return parent2

    def evolve_population(self, population):
        new_population = []

        for _ in range(self.population_size):
            # Select parents for crossover
            parent1 = self.select_parents(population)
            parent2 = self.select_parents(population)

            # Perform crossover with a certain probability
            if random.random() < self.crossover_probability:
                child1, child2 = self.crossover(parent1, parent2)
            else:
                # If no crossover, children are identical to parents
                child1, child2 = parent1, parent2

            # Perform mutation with a certain probability
            if random.random() < self.mutation_probability:
                child1 = self.mutate(child1)
            if random.random() < self.mutation_probability:
                child2 = self.mutate(child2)

            # Add the children to the new population
            new_population.append(child1)
            new_population.append(child2)

        return new_population

    def run_genetic_algorithm(self):
        # Initialize the initial population
        population = self.initialize_population()

        for generation in range(self.generations):
            # Evaluate the fitness of each individual in the population
            fitness_scores = [self.calculate_fitness(individual) for individual in population]

            # Select the best individuals to be parents for the next generation
            elite_indices = sorted(range(len(fitness_scores)), key=lambda k: fitness_scores[k], reverse=True)[:2]
            elite_parents = [population[i] for i in elite_indices]

            # Create the next generation using crossover and mutation
            population = self.evolve_population(population)

            # Preserve the elite parents in the new population
            population[0] = elite_parents[0]
            population[1] = elite_parents[1]

            # Print the best itinerary and its corresponding cost for each generation
            best_fitness = max(fitness_scores)
            best_index = fitness_scores.index(best_fitness)
            best_itinerary = population[best_index]

        # Return the best itinerary from the final population
        best_fitness = max(fitness_scores)
        best_index = fitness_scores.index(best_fitness)
        best_itinerary = population[best_index]

        return best_itinerary


# Input data from the command line argument
data = json.loads(sys.argv[1])


class ObjectIdEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)


# Initialize the model
model = TravelItineraryModel(attractions_data, hotels_data, restaurants_data, bus_data,
                             trains_data, flights_data, bus_data_return, trains_data_return, flights_data_return)

# Initialize the GeneticAlgorithm with the model and data
genetic_algorithm = GeneticAlgorithm(model, data)

# Run the genetic algorithm to generate the best itinerary
best_itinerary = genetic_algorithm.run_genetic_algorithm()

# Calculate the total cost of the best itinerary
total_cost_transportation = 0
total_cost_return_transportation = 0
total_cost_hotel = 0
total_cost_food = 0

for item in best_itinerary:
    if isinstance(item, dict) and 'price' in item:
        if item in bus_data + trains_data + flights_data:
            total_cost_transportation += item['price'] * data["num_travelers"]
        elif item in hotels_data:
            total_cost_hotel += item['price'] * data["num_travelers"] * data["duration_of_stay"]
        elif item in bus_data_return + trains_data_return + flights_data_return:
            total_cost_return_transportation += item['price']
        elif item in restaurants_data:
            total_cost_food += item['price'] * data["num_travelers"]

total_cost_transportation_both = total_cost_transportation + total_cost_return_transportation
# Calculate the total cost
total_cost = total_cost_transportation + total_cost_return_transportation + total_cost_hotel + total_cost_food

# Create a dictionary containing the final itinerary and calculations
result = {
    'itinerary': {
        'transportation': [item for item in best_itinerary if item in model.bus_data + model.trains_data + model.flights_data],
        'attractions': [item for item in best_itinerary if item in model.attractions_data],
        'hotels': [item for item in best_itinerary if item in model.hotels_data],
        'restaurants': [item for item in best_itinerary if item in model.restaurants_data],
        'return_transportation': [item for item in best_itinerary if item in model.bus_data_return + model.trains_data_return + model.flights_data_return]
    },
    'total_cost': {
        'transportation': total_cost_transportation_both,
        'hotel': total_cost_hotel,
        'food': total_cost_food,
        'total': total_cost
    }
}

# Serialize the final itinerary result using the custom JSON encoder
final_result = json.dumps(result, cls=ObjectIdEncoder)

# Send the final itinerary result to the client
print(final_result)



# import json
# import sys
# import pymongo
# import random
# import copy
# import math
# from bson.objectid import ObjectId

# # MongoDB client initialization
# client = pymongo.MongoClient("mongodb+srv://Yatra:Yatra@yatrasahayak.0gw5pwg.mongodb.net/?retryWrites=true&w=majority")

# # MongoDB collections
# attraction_db = client["Attractions"]
# attractions_collection = attraction_db["attractions_in_mumbai"]
# attractions_data = list(attractions_collection.find({}))

# hotel_db = client["Hotels"]
# hotels_collection = hotel_db["Hotels_in_Mumbai"]
# hotels_data = list(hotels_collection.find({}))

# restaurant_db = client["Restaurants"]
# restaurants_collection = restaurant_db["restaurants_in_mumbai"]
# restaurants_data = list(restaurants_collection.find({}))

# bus_db = client["Buses"]
# bus_collection = bus_db["buses"]
# bus_data = list(bus_collection.find({}))

# train_db = client["Trains"]
# trains_collection = train_db["trains"]
# trains_data = list(trains_collection.find({}))

# flight_db = client["Flights"]
# flights_collection = flight_db["flights"]
# flights_data = list(flights_collection.find({}))

# return_bus_db = client["Buses_return"]
# return_bus_collection = return_bus_db["Buses_return"]
# bus_data_return = list(return_bus_collection.find({}))

# return_train_db = client["Trains_return"]
# return_trains_collection = return_train_db["trains_return"]
# trains_data_return = list(return_trains_collection.find({}))

# return_flight_db = client["Flights_return"]
# return_flights_collection = return_flight_db["flights_return"]
# flights_data_return = list(return_flights_collection.find({}))


# class TravelItineraryModel:
#     def __init__(self, attractions_data, hotels_data, restaurants_data, bus_data, trains_data, flights_data, bus_data_return, trains_data_return, flights_data_return):
#         self.attractions_data = attractions_data
#         self.hotels_data = hotels_data
#         self.restaurants_data = restaurants_data
#         self.bus_data = bus_data
#         self.trains_data = trains_data
#         self.flights_data = flights_data
#         self.bus_data_return = bus_data_return
#         self.trains_data_return = trains_data_return
#         self.flights_data_return = flights_data_return

#     def is_valid_numeric(self, value):
#         try:
#             float(value)
#             return True
#         except (ValueError, TypeError):
#             return False

#     def generate_itinerary(self, num_travelers, start_location, destination, budget, date_of_departure, date_of_return, duration_of_stay, transportationType, preferences={}):
#         # Initialize the itinerary
#         itinerary = []

#         # Choose the best transportation option
#         transportation_options = []
#         if transportationType == 'bus':
#             transportation_options = self.bus_data
#             return_transportation_options = self.bus_data_return
#         elif transportationType == 'train':
#             transportation_options = self.trains_data
#             return_transportation_options = self.trains_data_return
#         elif transportationType == 'flight':
#             transportation_options = self.flights_data
#             return_transportation_options = self.flights_data_return

#         transportation = None
#         for transportation_option in transportation_options:
#             if "price" in transportation_option and transportation_option["price"]:
#                 try:
#                     # Convert to float
#                     price = float(transportation_option["price"])
#                     if price <= budget and transportation_option.get("departure_date") == date_of_departure and transportation_option.get("departure") == start_location and transportation_option.get("destination") == destination:
#                         if transportation is None or price < float(transportation.get("price", float('inf'))):
#                             transportation = transportation_option
#                 except ValueError:
#                     print("Invalid 'price' value for transportation:", transportation_option["price"])

#         # Choose the best return_transportation option
#         return_transportation = None
#         for return_transportation_option in return_transportation_options:
#             if "price" in return_transportation_option and return_transportation_option["price"]:
#                 try:
#                     # Convert to float
#                     price = float(return_transportation_option["price"])
#                     if price <= budget and return_transportation_option.get("departure_date") == date_of_return and return_transportation_option.get("departure") == destination and return_transportation_option.get("destination") == start_location:
#                         if return_transportation is None or price < float(return_transportation.get("price", float('inf'))):
#                             return_transportation = return_transportation_option
#                 except ValueError:
#                     print("Invalid 'price' value for return transportation:", return_transportation_option["price"])

#         # Define rating ranges
#         rating_ranges = [(1, 2), (2, 3), (3, 4), (4, 5)]

#         # Use frozenset for hashable representation of hotels
#         hotels = set()
#         for i in range(2 * duration_of_stay):
#             # Randomly shuffle the rating ranges
#             random.shuffle(rating_ranges)

#             # Fetch a hotel for each rating range
#             for rating_range in rating_ranges:
#                 # Fetch hotels within the selected rating range
#                 available_hotels = [hotel for hotel in self.hotels_data if
#                                     hotel["price"] <= budget and
#                                     self.is_valid_numeric(hotel.get("score")) and
#                                     float(hotel.get("score", 0)) >= rating_range[0] and
#                                     float(hotel.get("score", 0)) < rating_range[1] and
#                                     hotel["checkin"] == date_of_departure]

#                 # Convert hotel dictionaries to frozensets for set comparison
#                 available_hotels_frozensets = [frozenset(hotel.items()) for hotel in available_hotels]

#                 # Filter out hotels that have already been selected
#                 available_hotels = [hotel for hotel, frozenset_representation in zip(available_hotels, available_hotels_frozensets)
#                                     if frozenset_representation not in hotels]

#                 if available_hotels:
#                     selected_hotel = random.choice(available_hotels)
#                     hotels.add(frozenset(selected_hotel.items()))

#         # Convert frozensets back to dictionaries for the final itinerary
#         hotels_list = [dict(frozenset_representation) for frozenset_representation in hotels]

#         # Choose the best restaurants
#         restaurants = []
#         num_restaurants = min(2 * duration_of_stay, len(self.restaurants_data))
#         for restaurant_option in self.restaurants_data[:num_restaurants]:
#             if restaurant_option["price"] <= budget:
#                 restaurants.append(restaurant_option)

#         # Choose the best attractions
#         attractions = []
#         num_attractions = min(4 * duration_of_stay, len(self.attractions_data))
#         for attraction_option in self.attractions_data[:num_attractions]:
#             attractions.append(attraction_option)

#         # Add the transportation, hotel, restaurants, and attractions to the itinerary
#         itinerary.append(transportation)
#         for hotel in hotels_list:
#             itinerary.append(hotel)
#         for restaurant in restaurants:
#             itinerary.append(restaurant)
#         for attraction in attractions:
#             itinerary.append(attraction)
#         itinerary.append(return_transportation)

#         return itinerary


# class SimulatedAnnealing:
#     def __init__(self, model, data, initial_temperature=100, cooling_rate=0.003, num_iterations=1000):
#         self.model = model
#         self.data = data
#         self.initial_temperature = initial_temperature
#         self.cooling_rate = cooling_rate
#         self.num_iterations = num_iterations

#     def calculate_cost(self, itinerary):
#         # Calculate the total cost of the itinerary
#         total_cost_transportation = 0
#         total_cost_return_transportation = 0
#         total_cost_hotel = 0
#         total_cost_food = 0

#         for item in itinerary:
#             if isinstance(item, dict) and 'price' in item:
#                 if item in self.model.bus_data + self.model.trains_data + self.model.flights_data:
#                     total_cost_transportation += item['price'] * self.data["num_travelers"]
#                 elif item in self.model.hotels_data:
#                     total_cost_hotel += item['price'] * self.data["num_travelers"] * self.data["duration_of_stay"]
#                 elif item in self.model.bus_data_return + self.model.trains_data_return + self.model.flights_data_return:
#                     total_cost_return_transportation += item['price']
#                 elif item in self.model.restaurants_data:
#                     total_cost_food += item['price'] * self.data["num_travelers"]

#         total_cost_transportation_both = total_cost_transportation + total_cost_return_transportation
#         # Calculate the total cost
#         total_cost = total_cost_transportation_both + total_cost_hotel + total_cost_food

#         return total_cost

#     def generate_neighbor(self, itinerary):
#         # Generate a neighbor itinerary by making small random changes
#         neighbor = copy.deepcopy(itinerary)

#         # Randomly choose an item to mutate
#         mutation_point = random.randint(0, len(neighbor) - 1)

#         # Mutate the chosen item (replace it with a new randomly generated item)
#         neighbor[mutation_point] = self.model.generate_itinerary(self.data['num_travelers'],
#                                                                  self.data['start_location'],
#                                                                  self.data['destination'],
#                                                                  self.data['budget'],
#                                                                  self.data['date_of_departure'],
#                                                                  self.data['date_of_return'],
#                                                                  self.data['duration_of_stay'],
#                                                                  self.data['transportationType'])[mutation_point]

#         return neighbor

#     def accept_neighbor(self, current_cost, neighbor_cost, temperature):
#         # Accept the neighbor itinerary based on the Metropolis criterion
#         if neighbor_cost < current_cost:
#             return True
#         else:
#             probability = math.exp(-(neighbor_cost - current_cost) / temperature)
#             return random.random() < probability

#     def anneal(self):
#         # Initialize current solution
#         current_solution = self.model.generate_itinerary(self.data['num_travelers'], self.data['start_location'],
#                                                          self.data['destination'], self.data['budget'],
#                                                          self.data['date_of_departure'], self.data['date_of_return'],
#                                                          self.data['duration_of_stay'], self.data['transportationType'])

#         # Initialize best solution
#         best_solution = current_solution

#         # Initialize current cost
#         current_cost = self.calculate_cost(current_solution)

#         # Initialize best cost
#         best_cost = current_cost

#         # Initialize temperature
#         temperature = self.initial_temperature

#         # Annealing process
#         for _ in range(self.num_iterations):
#             # Generate a neighbor solution
#             neighbor_solution = self.generate_neighbor(current_solution)

#             # Calculate the cost of the neighbor solution
#             neighbor_cost = self.calculate_cost(neighbor_solution)

#             # Accept or reject the neighbor solution
#             if self.accept_neighbor(current_cost, neighbor_cost, temperature):
#                 current_solution = neighbor_solution
#                 current_cost = neighbor_cost

#                 # Update the best solution if necessary
#                 if current_cost < best_cost:
#                     best_solution = current_solution
#                     best_cost = current_cost

#             # Cool down the temperature
#             temperature *= 1 - self.cooling_rate

#         return best_solution


# # Input data from the command line argument
# data = json.loads(sys.argv[1])

# class ObjectIdEncoder(json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, ObjectId):
#             return str(obj)
#         return json.JSONEncoder.default(self, obj)

# # Initialize the model
# model = TravelItineraryModel(attractions_data, hotels_data, restaurants_data, bus_data,
#                              trains_data, flights_data, bus_data_return, trains_data_return, flights_data_return)

# # Initialize the SimulatedAnnealing with the model and data
# sa = SimulatedAnnealing(model, data)

# # Run simulated annealing to generate the best itinerary
# best_itinerary = sa.anneal()

# # Calculate the total cost of the best itinerary
# total_cost = sa.calculate_cost(best_itinerary)

# # Calculate the transportation cost separately
# total_cost_transportation = sum(item['price'] for item in best_itinerary if item in model.bus_data + model.trains_data + model.flights_data)

# total_cost_return_transportation = sum(item['price'] for item in best_itinerary if item in model.bus_data_return + model.trains_data_return + model.flights_data_return)

# # Calculate the hotel cost separately
# total_cost_hotel = sum(item['price'] * data["num_travelers"] * data["duration_of_stay"] for item in best_itinerary if item in model.hotels_data)

# # Calculate the food cost separately
# total_cost_food = sum(item['price'] * data["num_travelers"] for item in best_itinerary if item in model.restaurants_data)

# # Calculate the total transportation cost (both ways)
# total_cost_transportation_both = total_cost_transportation + total_cost_return_transportation

# # Create a dictionary containing the final itinerary and total cost
# result = {
#     'itinerary': {
#         'transportation': [item for item in best_itinerary if item in model.bus_data + model.trains_data + model.flights_data],
#         'attractions': [item for item in best_itinerary if item in model.attractions_data],
#         'hotels': [item for item in best_itinerary if item in model.hotels_data],
#         'restaurants': [item for item in best_itinerary if item in model.restaurants_data],
#         'return_transportation': [item for item in best_itinerary if item in model.bus_data_return + model.trains_data_return + model.flights_data_return]
#     },
#     'total_cost': {
#         'transportation': total_cost_transportation_both,
#         'hotel': total_cost_hotel,
#         'food': total_cost_food,
#         'total': total_cost
#     }
# }

# # Serialize the final result using the custom JSON encoder
# final_result = json.dumps(result, cls=ObjectIdEncoder)

# # Send the final result to the client
# print(final_result)
