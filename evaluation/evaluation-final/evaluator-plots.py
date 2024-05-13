import json
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D
from scipy.interpolate import make_interp_spline, griddata
import random
from typing import Dict

class PlotData:
    titles = []
    title = ""
    top_p = []
    temperature = []
    complexity = []
    speed = []
    accuracy = []
    relevance = []
    efficiency = []
    completion = []
    finalRating = []
    successRate = []
    timeTaken = []
    contextUsed = []
    toolsCalled = []
    
    def __init__(self):
        self.titles = []
        self.title = ""
        self.top_p = []
        self.temperature = []
        self.complexity = []
        self.speed = []
        self.accuracy = []
        self.relevance = []
        self.efficiency = []
        self.completion = []
        self.finalRating = []
        self.successRate = []
        self.timeTaken = []
        self.contextUsed = []
        self.toolsCalled = []

loadedData = []

def load_data(fileName) -> Dict[str, PlotData]:
    with open(fileName, 'r') as file:
        data = json.load(file)
    dataArray = data['data']
    plot_data_dict = {}
    for i in range(len(dataArray)):
        item = dataArray[i]
        input_data = item['input']
        output_data = item['output']

        for key, value in input_data.items():
            try:
                input_data[key] = float(value)
            except Exception as e:
                pass

        for key, value in output_data.items():
            if key != "comment":
                try:
                    output_data[key] = float(value)
                except Exception as e:
                    pass

        dataArray[i]['input'] = input_data
        dataArray[i]['output'] = output_data

        title = input_data["title"]
        top_p = input_data["top_p"]
        temperature = input_data["temperature"]
        complexity = input_data["complexity"]

        speed = output_data["speed"]
        accuracy = output_data["accuracy"]
        relevance = output_data["relevance"]
        efficiency = output_data["efficiency"]
        completion = output_data["completion"]
        finalRating = output_data["finalRating"]
        successRate = output_data["successRate"]
        timeTaken = output_data["timeTaken"]
        contextUsed = output_data["contextUsed"]
        toolsCalled = output_data["toolsCalled"]
        
        # If the title doesn't exist in the dictionary, create a new PlotData instance
        if title not in plot_data_dict:
            plot_data_dict[title] = PlotData()
            plot_data_dict[title].title = title

        # Append the input values to the corresponding lists
        plot_data_dict[title].top_p.append(top_p)
        plot_data_dict[title].temperature.append(temperature)
        plot_data_dict[title].complexity.append(complexity/10.0)
        plot_data_dict[title].speed.append(speed/100.0)
        plot_data_dict[title].accuracy.append(accuracy/100.0)
        plot_data_dict[title].relevance.append(relevance/100.0)
        plot_data_dict[title].efficiency.append(efficiency/100.0)
        plot_data_dict[title].completion.append(completion/100.0)
        plot_data_dict[title].finalRating.append(finalRating/100.0)
        plot_data_dict[title].successRate.append(successRate/100.0)
        plot_data_dict[title].timeTaken.append(timeTaken)
        plot_data_dict[title].contextUsed.append(contextUsed)
        plot_data_dict[title].toolsCalled.append(toolsCalled)
    global loadedData
    loadedData = dataArray
    return plot_data_dict
        
def plot_3d_surface(xValues, yValues, zValues, title, xLabel, yLabel, zLabel):
    # Create a meshgrid for Top-p and Temperature
    x_unique = sorted(list(set(xValues)))
    y_unique = sorted(list(set(yValues)))
    x_grid, y_grid = np.meshgrid(x_unique, y_unique)

    # Interpolate the success rate data onto the meshgrid with higher resolution
    x_grid_dense = np.linspace(min(x_unique), max(x_unique), 100)
    y_grid_dense = np.linspace(min(y_unique), max(y_unique), 100)
    x_grid_dense, y_grid_dense = np.meshgrid(x_grid_dense, y_grid_dense)
    z_grid = griddata((xValues, yValues), zValues, (x_grid_dense, y_grid_dense), method='cubic')

    # Plot the surface
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    surf = ax.plot_surface(x_grid_dense, y_grid_dense, z_grid, cmap='viridis', antialiased=True, rstride=1, cstride=1, linewidth=0.2)
    fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)
    ax.set_xlabel(xLabel)
    ax.set_ylabel(yLabel)
    ax.set_zlabel(zLabel)
    ax.set_title(title)

    # Adjust the viewing angle
    ax.view_init(elev=30, azim=-45)
    plt.show()

def plot_bar_chart(xValues, yValues, title, xLabel, yLabel):
    plt.figure(figsize=(8, 6))
    plt.bar(xValues, yValues)
    plt.xlabel(xLabel)
    plt.ylabel(yLabel)
    plt.title(title)
    plt.xticks(rotation=90)
    plt.show()

def plot_line(plt, xValues, yValues, legend, color):
    unique_x, unique_indices = np.unique(xValues, return_inverse=True)
    x_smooth = np.linspace(min(unique_x), max(unique_x), 300)
    y_sorted = [yValues[i] for i in unique_indices]
    y_smooth = make_interp_spline(unique_x, y_sorted)(x_smooth)

    plt.plot(x_smooth, y_smooth, label=legend, color=color)

def plot_2d(xValues, yValues, title, xLabel, yLabel):
    plt.figure(figsize=(8, 6))
    plt.scatter(xValues, yValues)
    
    plot_line(plt, xValues, yValues, "Success Rate", "red")


    # Plot the scatter points on top of the curve
    x_array = np.array(xValues)
    y_array = np.array(yValues)
    plt.scatter(x_array, y_array, zorder=2)  # Set a higher zorder value

    plt.xlabel(xLabel)
    plt.ylabel(yLabel)
    plt.title(title)
    plt.show()

def plot_2d_multiple(xValues, lines, title, xLabel, yLabel):
    plt.figure(figsize=(8, 6))

    for line in lines:
        plot_line(plt, xValues, line["yValues"], line["legend"], line["color"])

    plt.xlabel(xLabel)
    plt.ylabel(yLabel)
    plt.title(title)
    plt.legend()
    plt.show()


def plot_heatmap(xValues, yValues, zValues, title, xLabel, yLabel, zLabel):
    # Create a meshgrid for Top-p and Temperature
    x_unique = sorted(list(set(xValues)))
    y_unique = sorted(list(set(yValues)))
    x_grid, y_grid = np.meshgrid(x_unique, y_unique)

    # Interpolate the success rate data onto the meshgrid
    z_grid = griddata((xValues, yValues), zValues, (x_grid, y_grid), method='cubic')

    # Create a heatmap
    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(z_grid, cmap='viridis', extent=[min(x_unique), max(x_unique), min(y_unique), max(y_unique)], origin='lower', aspect='auto', interpolation='nearest')

    # Add colorbar
    cbar = fig.colorbar(im, ax=ax)
    cbar.set_label(zLabel, rotation=270, labelpad=15)

    # Set labels and title
    ax.set_xlabel(xLabel)
    ax.set_ylabel(yLabel)
    ax.set_title(title)

    plt.show()

titles = [
    "TopPvsTemperature",
    "ComplexityOnly",
    "ToolsOnly",
    "TemperatureVsComplexity",
    "TopPVsComplexity"
]

if __name__ == '__main__':
    data = load_data("evaluation.json")
    CombinedData = PlotData()
    toolsData = PlotData()
    for key, value in data.items():
        if key not in titles:
            toolsData.titles.append(key)
            toolsData.top_p.extend(value.top_p)
            toolsData.temperature.extend(value.temperature)
            toolsData.complexity.extend(value.complexity)
            toolsData.speed.extend(value.speed)
            toolsData.accuracy.extend(value.accuracy)
            toolsData.relevance.extend(value.relevance)
            toolsData.efficiency.extend(value.efficiency)
            toolsData.completion.extend(value.completion)
            toolsData.finalRating.extend(value.finalRating)
            toolsData.successRate.extend(value.successRate)
            toolsData.timeTaken.extend(value.timeTaken)
            toolsData.contextUsed.extend(value.contextUsed)
            toolsData.toolsCalled.extend(value.toolsCalled)
        CombinedData.top_p.extend(value.top_p)
        CombinedData.temperature.extend(value.temperature)
        CombinedData.complexity.extend(value.complexity)
        CombinedData.speed.extend(value.speed)
        CombinedData.accuracy.extend(value.accuracy)
        CombinedData.relevance.extend(value.relevance)
        CombinedData.efficiency.extend(value.efficiency)
        CombinedData.completion.extend(value.completion)
        CombinedData.finalRating.extend(value.finalRating)
        CombinedData.successRate.extend(value.successRate)
        CombinedData.timeTaken.extend(value.timeTaken)
        CombinedData.contextUsed.extend(value.contextUsed)
        CombinedData.toolsCalled.extend(value.toolsCalled)

    ComplexityOnly = data["ComplexityOnly"]
    TemperatureVsComplexity = data["TemperatureVsComplexity"]
    
    plot_bar_chart(toolsData.titles, toolsData.successRate, "Success Rate for Different Tools", "Tools", "Success Rate")

    plot_2d(ComplexityOnly.complexity, ComplexityOnly.successRate, "Complexity vs Success Rate", "Complexity", "Success Rate")

    # plot me multiple lines for complexity vs the following: speed, accuracy, relevance, efficiency, completion
    plot_2d_multiple(ComplexityOnly.complexity, [
        {"yValues": ComplexityOnly.speed, "legend": "Speed", "color": "red"},
        {"yValues": ComplexityOnly.accuracy, "legend": "Accuracy", "color": "blue"},
        {"yValues": ComplexityOnly.relevance, "legend": "Relevance", "color": "green"},
        {"yValues": ComplexityOnly.efficiency, "legend": "Efficiency", "color": "orange"},
        {"yValues": ComplexityOnly.completion, "legend": "Completion", "color": "purple"}
    ], "Complexity vs Metrics", "Complexity", "Metrics")

    # plot_3d_surface(CombinedData.top_p, CombinedData.temperature, CombinedData.successRate, "Top-p vs Temperature vs Success Rate", "Top-p", "Temperature", "Success Rate")
    # plot_heatmap(CombinedData.top_p, CombinedData.temperature, CombinedData.successRate, "Top-p vs Temperature vs Success Rate", "Top-p", "Temperature", "Success Rate")

    # plot_3d_surface(CombinedData.top_p, CombinedData.temperature, CombinedData.contextUsed, "Top-p vs Temperature vs Success Rate", "Top-p", "Temperature", "Context Used")
    # plot_heatmap(CombinedData.top_p, CombinedData.temperature, CombinedData.contextUsed, "Top-p vs Temperature vs Success Rate", "Top-p", "Temperature", "Context Used")

    # plot_3d_surface(CombinedData.top_p, CombinedData.temperature, CombinedData.timeTaken, "Top-p vs Temperature vs Success Rate", "Top-p", "Temperature", "Time Taken")
    # plot_heatmap(CombinedData.top_p, CombinedData.temperature, CombinedData.timeTaken, "Top-p vs Temperature vs Success Rate", "Top-p", "Temperature", "Time Taken")

    plot_3d_surface(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.successRate, "Temperature vs Complexity vs Success Rate", "Temperature", "Complexity", "Success Rate")
    plot_heatmap(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.successRate, "Temperature vs Complexity vs Success Rate", "Temperature", "Complexity", "Success Rate")

    plot_3d_surface(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.timeTaken, "Temperature vs Complexity vs Time Taken", "Temperature", "Complexity", "Time Taken")
    plot_heatmap(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.timeTaken, "Temperature vs Complexity vs Time Taken", "Temperature", "Complexity", "Time Taken")

    plot_3d_surface(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.toolsCalled, "Temperature vs Complexity vs Tools Called", "Temperature", "Complexity", "Tools Called")
    plot_heatmap(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.toolsCalled, "Temperature vs Complexity vs Tools Called", "Temperature", "Complexity", "Tools Called")

    plot_3d_surface(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.contextUsed, "Temperature vs Complexity vs Context Used", "Temperature", "Complexity", "Context Used")
    plot_heatmap(TemperatureVsComplexity.temperature, TemperatureVsComplexity.complexity, TemperatureVsComplexity.contextUsed, "Temperature vs Complexity vs Context Used", "Temperature", "Complexity", "Context Used")

    # plot_3d_surface(CombinedData.top_p, CombinedData.complexity, CombinedData.successRate, "Top P vs Complexity vs Success Rate", "Top P", "Complexity", "Success Rate")
    # plot_heatmap(CombinedData.top_p, CombinedData.complexity, CombinedData.successRate, "Top P vs Complexity vs Success Rate", "Top P", "Complexity", "Success Rate")
