import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Define the range and resolution of the dataset
num_samples = 100
complexity_range = np.linspace(0, 1, num_samples)
temperature_range = np.linspace(0, 1, num_samples)

# Generate the success rate data based on the specified trends
success_rate = np.zeros((num_samples, num_samples))
for i, temp in enumerate(temperature_range):
    for j, complexity in enumerate(complexity_range):
        # Smooth out the surface by generating success rates based on distance from the center
        center = 0.5
        distance = np.sqrt((complexity - center)**2 + (temp - center)**2)
        success_rate[i, j] = np.clip(np.exp(-5 * distance) + np.random.uniform(-0.1, 0.1), 0, 1)

# Create meshgrid for 3D plotting
X, Y = np.meshgrid(complexity_range, temperature_range)

# Plot in 3D
fig = plt.figure(figsize=(10, 6))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(X, Y, success_rate, cmap='viridis', edgecolor='none')
ax.set_xlabel('Message Complexity')
ax.set_ylabel('Temperature of the System')
ax.set_zlabel('Success Rate')
ax.set_title('Success Rate 3D Plot (Smoothed)')
fig.colorbar(surf, label='Success Rate')
plt.show()
