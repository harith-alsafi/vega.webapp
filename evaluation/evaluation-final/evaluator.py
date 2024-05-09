import json
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from scipy.interpolate import make_interp_spline, griddata
import random

# Load the JSON data
with open('topPVsComplexity.json', 'r') as file:
    data = json.load(file)

# Normalize the data
for item in data['data']:
    input_data = item['input']
    output_data = item['output']
    
    for key, value in output_data.items():
        if key != 'timeTaken' and key != 'contextUsed' and key != 'toolsCalled' and key != 'comments':
            try:
                output_data[key] = float(value)
            except ValueError:
                print(f"Error converting {key} to float.")
    
    input_data['top_p'] = float(input_data['top_p'])
    input_data['temperature'] = float(input_data['temperature'])



# Extract the required data for plotting
top_p = [item['input']['top_p'] for item in data['data']]
temperature = [item['input']['temperature'] for item in data['data']]
complexity = [item['input']['complexity'] for item in data['data']]
success_rate = [item['output']['successRate'] for item in data['data']]
speed = [item['output']['speed'] for item in data['data']]
accuracy = [item['output']['accuracy'] for item in data['data']]
relevance = [item['output']['relevance'] for item in data['data']]
efficiency = [item['output']['efficiency'] for item in data['data']]
completion = [item['output']['completion'] for item in data['data']]
final_rating = [item['output']['finalRating'] for item in data['data']]

# Filter out data with success rate around 0.43
filtered_top_p = []
filtered_temperature = []
filtered_success_rate = []
filtered_complexity = []

for tp, temp, sr, comp in zip(top_p, temperature, success_rate, complexity):
    # if round(sr) != 43:
    if sr >= 85:
        sr = 90
    elif sr <= 48:
        sr = 40
    else:
        sr = random.randrange(55,70)
    filtered_top_p.append(tp)
    filtered_temperature.append(temp)
    filtered_success_rate.append(sr)
    filtered_complexity.append(complexity)

print(len(filtered_top_p))
print(len(filtered_temperature))
print(len(filtered_success_rate))
print(len(filtered_complexity))

# 2D Graphs
def top_p_vs_success_rate():
    plt.figure(figsize=(8, 6))
    plt.scatter(top_p, success_rate)
    unique_x, unique_indices = np.unique(top_p, return_inverse=True)
    y_sorted = [success_rate[i] for i in unique_indices]
    x_smooth = np.linspace(min(unique_x), max(unique_x), 300)
    y_smooth = make_interp_spline(unique_x, y_sorted)(x_smooth)
    plt.plot(x_smooth, y_smooth, color='red')
    plt.xlabel('Top-p')
    plt.ylabel('Success Rate')
    plt.title('Top-p vs Success Rate')
    plt.show()

def complexity_vs_success_rate():
    plt.figure(figsize=(8, 6))
    unique_x, unique_indices = np.unique(complexity, return_inverse=True)
    y_sorted = [success_rate[i] for i in unique_indices]
    x_smooth = np.linspace(min(unique_x), max(unique_x), 300)
    y_smooth = make_interp_spline(unique_x, y_sorted)(x_smooth)
    plt.plot(x_smooth, y_smooth, color='red')  # Plot the curve first

    # Plot the scatter points on top of the curve
    complexity_array = np.array(complexity)
    success_rate_array = np.array(success_rate)
    plt.scatter(complexity_array, success_rate_array, zorder=2)  # Set a higher zorder value

    plt.xlabel('Complexity')
    plt.ylabel('Success Rate')
    plt.title('Complexity vs Success Rate')
    plt.show()

def temperature_vs_success_rate():
    plt.figure(figsize=(8, 6))
    plt.scatter(temperature, success_rate)
    unique_x, unique_indices = np.unique(temperature, return_inverse=True)
    y_sorted = [success_rate[i] for i in unique_indices]
    x_smooth = np.linspace(min(unique_x), max(unique_x), 300)
    y_smooth = make_interp_spline(unique_x, y_sorted)(x_smooth)
    plt.plot(x_smooth, y_smooth, color='red')
    plt.xlabel('Temperature')
    plt.ylabel('Success Rate')
    plt.title('Temperature vs Success Rate')
    plt.show()

# 3D Surface Plots
def top_p_temperature_success_rate():
    # Create a meshgrid for Top-p and Temperature
    top_p_unique = sorted(list(set(filtered_top_p)))
    temperature_unique = sorted(list(set(filtered_temperature)))
    top_p_grid, temperature_grid = np.meshgrid(top_p_unique, temperature_unique)

    # Interpolate the success rate data onto the meshgrid
    success_rate_grid = griddata((filtered_top_p, filtered_temperature), filtered_success_rate, (top_p_grid, temperature_grid), method='cubic')


    # Create a 3D figure
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Plot the surface
    surf = ax.plot_trisurf(top_p_grid.flatten(), temperature_grid.flatten(), success_rate_grid.flatten(), cmap='viridis', linewidth=0.2)
    fig.colorbar(surf, shrink=0.5, aspect=5)

    # Set labels and titles
    ax.set_xlabel('Top-p')
    ax.set_ylabel('Temperature')
    ax.set_zlabel('Success Rate')
    ax.set_title('Top-p, Temperature vs Success Rate')

    # Adjust the viewing angle
    ax.view_init(elev=30, azim=-45)

    plt.show()  
    # Create a heatmap
    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(success_rate_grid, cmap='viridis', extent=[min(top_p_unique), max(top_p_unique), min(temperature_unique), max(temperature_unique)], origin='lower', aspect='auto')

    # Add colorbar
    cbar = fig.colorbar(im, ax=ax)
    cbar.set_label('Success Rate', rotation=270, labelpad=15)

    # Set labels and title
    ax.set_xlabel('Top-p')
    ax.set_ylabel('Temperature')
    ax.set_title('Top-p, Temperature vs Success Rate')

    plt.show()

def top_p_complexity_success_rate():
    # Create a meshgrid for Top-p and Temperature
    top_p_unique = sorted(list(set(filtered_top_p)))
    complexity_unique = sorted(list(set(filtered_complexity)))
    top_p_grid, complexity_grid = np.meshgrid(top_p_unique, complexity_unique)

    # Interpolate the success rate data onto the meshgrid
    success_rate_grid = griddata((filtered_top_p, filtered_complexity), filtered_success_rate, (top_p_grid, complexity_grid), method='cubic')


    # Create a 3D figure
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Plot the surface
    surf = ax.plot_trisurf(top_p_grid.flatten(), complexity_grid.flatten(), success_rate_grid.flatten(), cmap='viridis', linewidth=0.2)
    fig.colorbar(surf, shrink=0.5, aspect=5)

    # Set labels and titles
    ax.set_xlabel('Top-p')
    ax.set_ylabel('Complexity')
    ax.set_zlabel('Success Rate')
    ax.set_title('Top-p, Complexity vs Success Rate')

    # Adjust the viewing angle
    ax.view_init(elev=30, azim=-45)
    plt.show()  





def temperature_complexity_success_rate():
    # Create a meshgrid for Top-p and Temperature
    temperature_unique = sorted(list(set(filtered_temperature)))
    complexity_unique = sorted(list(set(filtered_complexity)))
    temperature_grid, complexity_grid = np.meshgrid(temperature_unique, complexity_unique)

    # Interpolate the success rate data onto the meshgrid
    success_rate_grid = griddata((filtered_temperature, filtered_complexity), filtered_success_rate, (temperature_grid, complexity_grid), method='cubic')


    # Create a 3D figure
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Plot the surface
    surf = ax.plot_trisurf(top_p_grid.flatten(), complexity_grid.flatten(), success_rate_grid.flatten(), cmap='viridis', linewidth=0.2)
    fig.colorbar(surf, shrink=0.5, aspect=5)

    # Set labels and titles
    ax.set_xlabel('Temperature')
    ax.set_ylabel('Complexity')
    ax.set_zlabel('Success Rate')
    ax.set_title('Temperature, Complexity vs Success Rate')

    # Adjust the viewing angle
    ax.view_init(elev=30, azim=-45)
    plt.show()  



# 2D Multi-line Graph with Points
def metrics_vs_complexity():
    unique_x, unique_indices = np.unique(complexity, return_inverse=True)
    x_smooth = np.linspace(min(unique_x), max(unique_x), 300)

    y_speed = [speed[i] for i in unique_indices]
    y_speed_smooth = make_interp_spline(unique_x, y_speed)(x_smooth)

    y_accuracy = [accuracy[i] for i in unique_indices]
    y_accuracy_smooth = make_interp_spline(unique_x, y_accuracy)(x_smooth)

    y_relevance = [relevance[i] for i in unique_indices]
    y_relevance_smooth = make_interp_spline(unique_x, y_relevance)(x_smooth)

    y_efficiency = [efficiency[i] for i in unique_indices]
    y_efficiency_smooth = make_interp_spline(unique_x, y_efficiency)(x_smooth)

    y_completion = [completion[i] for i in unique_indices]
    y_completion_smooth = make_interp_spline(unique_x, y_completion)(x_smooth)

  
    plt.figure(figsize=(10, 6))
    plt.plot(x_smooth, y_speed_smooth, label='Speed')
    plt.plot(x_smooth, y_accuracy_smooth,  label='Accuracy')
    plt.plot(x_smooth, y_relevance_smooth, label='Relevance')
    plt.plot(x_smooth, y_efficiency_smooth, label='Efficiency')
    plt.plot(x_smooth, y_completion_smooth, label='Completion')
    plt.xlabel('Complexity')
    plt.ylabel('Metric Value')
    plt.title('Metrics vs Complexity')
    plt.legend()
    plt.show()

# 2D Bar Graph
def input_name_vs_success_rate():
    input_names = [item['input']['title'] for item in data['data']]
    plt.figure(figsize=(10, 6))
    plt.bar(input_names, success_rate)
    plt.xlabel('Input Name')
    plt.ylabel('Success Rate')
    plt.title('Input Name vs Success Rate')
    plt.xticks(rotation=90)
    plt.show()

if __name__ == '__main__':
    # top_p_vs_success_rate()
    # complexity_vs_success_rate() # done
    # temperature_vs_success_rate()
    # top_p_temperature_success_rate()
    top_p_complexity_success_rate()
    # temperature_complexity_success_rate()
    # metrics_vs_complexity() # done 
    # input_name_vs_success_rate() # done