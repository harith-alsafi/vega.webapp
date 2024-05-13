import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import interp2d
from scipy.interpolate import griddata
# Define the range and resolution of the dataset
num_samples = 8
complexity_range = np.linspace(0, 1, num_samples)
temperature_range = np.linspace(0, 1, num_samples)

# Generate random noise for the success rate
noise = np.random.normal(0, 0.1, size=(num_samples, num_samples))

# Generate the success rate data based on the specified trends
success_rate = np.zeros((num_samples, num_samples))
for i, temp in enumerate(temperature_range):
    for j, complexity in enumerate(complexity_range):
        temp_threshold_low = np.random.uniform(0.15, 0.35)
        comp_threshold_low = np.random.uniform(0.15, 0.35)
        temp_threshold_high = np.random.uniform(0.65, 0.75)
        comp_threshold_high = np.random.uniform(0.65, 0.75)
        if temp < temp_threshold_low and complexity < comp_threshold_low:
            success_rate[i, j] = np.clip(0.85 + np.random.uniform(-0.1, 0.1) + noise[i, j], 0, 1)
        elif temp > temp_threshold_high and complexity > comp_threshold_high:
            success_rate[i, j] = np.clip(0.85 + np.random.uniform(-0.1, 0.1) + noise[i, j], 0, 1)
        elif temp < temp_threshold_low and complexity > comp_threshold_low:
            success_rate[i, j] = np.clip(0.1 + np.random.uniform(-0.1, 0.1) + noise[i, j], 0, 1)
        else:
            success_rate[i, j] = np.clip(temp * 0.4 + complexity * 0.4 + np.random.uniform(-0.3, 0.3) + noise[i, j], 0, 1)


# Create a 2D interpolation function for smoother plotting
f = interp2d(complexity_range, temperature_range, success_rate)

# Define the grid for plotting
xnew = np.linspace(0, 1, num_samples * 10)
ynew = np.linspace(0, 1, num_samples * 10)

# Interpolate the data on the new grid
znew = f(xnew, ynew)

# Plot the heatmap
plt.figure(figsize=(10, 6))
plt.imshow(success_rate, extent=[0, 1, 0, 1], origin='lower', cmap='viridis', aspect='auto', interpolation='bicubic')
plt.colorbar(label='Success Rate')
plt.xlabel('Message Complexity')
plt.ylabel('Temperature of the System')
plt.title('Success Rate Heatmap')
plt.show()

# Create meshgrid for 3D plotting
# Create meshgrid for 3D plotting
X, Y = np.meshgrid(complexity_range, temperature_range)

# Interpolate the data for smoother plotting
x_new = np.linspace(0, 1, 5 * num_samples)
y_new = np.linspace(0, 1, 5 * num_samples)
X_new, Y_new = np.meshgrid(x_new, y_new)
success_rate_smooth = griddata((X.flatten(), Y.flatten()), success_rate.flatten(), (X_new, Y_new), method='cubic')

# Plot in 3D
fig = plt.figure(figsize=(10, 6))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(X_new, Y_new, success_rate_smooth, cmap='viridis', edgecolor='none', antialiased=True,  rcount=100, ccount=100, linewidth=0.0)
ax.set_xlabel('Message Complexity')
ax.set_ylabel('Temperature of the System')
ax.set_zlabel('Success Rate')
ax.set_title('Success Rate 3D Plot (Smoothed)')
fig.colorbar(surf, label='Success Rate')
plt.show()
