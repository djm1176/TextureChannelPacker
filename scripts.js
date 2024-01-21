function allowDrop(event) {
    event.preventDefault();
}

function drop(event, targetField) {
    event.preventDefault();
    
    var files = event.dataTransfer.files;
    
    if (files.length > 0) {
        // Handle dropped files (assuming only one file for simplicity)
        var file = files[0];
        
        if (file.type.startsWith("image/")) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                var img = document.createElement("img");
                img.src = e.target.result;
                targetField.innerHTML = ""; // Clear existing content
                targetField.appendChild(img);
				
				img.onload = function() {
					onImageLoaded(img, targetField);
				};

            };
            
            reader.readAsDataURL(file);
        }
    }
}

function selectImage(targetField) {
    // Trigger input[type="file"] click
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    	
    input.onchange = function (e) {
        var file = e.target.files[0];
        
        if (file) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                var img = document.createElement("img");
                img.src = e.target.result;
				
                targetField.innerHTML = ""; // Clear existing content
                targetField.appendChild(img);
				
				img.onload = function() {
					onImageLoaded(img, targetField);
				};

            };
            
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

function onImageLoaded(img, targetField) {
	console.log("Image loaded");
	document.getElementById("generateButton").removeAttribute("disabled");
	// Validate aspect ratio, and show a tooltip warning the user if it's not 1:1
	validateAspectRatio(img, targetField);
	
	// Check to see if canvas has been set to a certain size
	if(canvasSizeSet == false) {
		console.log("Canvas size set to:", img.naturalWidth, img.naturalHeight);
		canvasSizeSet = true;
		canvas = document.getElementById("mappedCanvas");
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;
	}
	
	// Add a remove button to the top right corner
	// TODO: It's a work in progress, not a front end dev so still figuring this out
	// addRemoveButton(targetField);
	
}

function addRemoveButton(targetField) {
	var removeButton = document.createElement("div");
	removeButton.setAttribute("class", "icon-circle remove-icon");
	
	// Create an SVG element for the X icon
	var svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgIcon.setAttribute("class", "icon-svg");
	svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	svgIcon.setAttribute("viewBox", "0 0 24 24");
	
	var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("id", "Vector");
	path.setAttribute("d", "M6 12H12M12 12H18M12 12V18M12 12V6");
	path.setAttribute("transform", "rotate(45 12 12)");
	
	// Append the path to the SVG
	svgIcon.appendChild(path);
	
	// Allow removing via function
	removeButton.onclick = function() {
		console.log("Hello");
		targetField.innerHTML = "";
	};
	
	// Append the SVG to the remove button container
	removeButton.appendChild(svgIcon);	
	targetField.appendChild(removeButton);
	
}

function addWarningMessage(targetField, notificationText) {
	
	// Check to see if we already have a warning circle
	var warningCircle = targetField.querySelector(".warning-icon");
	
	if(warningCircle == null) {
		// Create a warning circle container
		warningCircle = document.createElement("div");
		warningCircle.setAttribute("class", "icon-circle warning-icon");
		
		// Create an SVG element for the warning icon
		var svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgIcon.setAttribute("class", "icon-svg");
		svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svgIcon.setAttribute("viewBox", "0 0 24 24");
		
		var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("id", "Vector");
		path.setAttribute("d", "M12 6V14M12.0498 18V18.1L11.9502 18.1002V18H12.0498Z");

		// Append the path to the SVG
		svgIcon.appendChild(path);

		// Append the SVG to the warning circle container
		warningCircle.appendChild(svgIcon);	
		targetField.appendChild(warningCircle);
		
	}

	
	// Add an item to the tooltipContainer
	var tooltip = document.createElement("div");
	tooltip.setAttribute("class", "tooltip");
	tooltip.innerHTML = notificationText;
	
	warningCircle.appendChild(tooltip);
}

function validateAspectRatio(img, targetField) {
    var aspectRatio = img.naturalWidth / img.naturalHeight;
    var isOneToOne = img.naturalWidth === img.naturalHeight;

	if (!isOneToOne) {
        addWarningMessage(targetField, "The image's aspect ratio isn't 1:1");
        addWarningMessage(targetField, "The image's aspect ratio isn't 1:1");
    }
}

function getImageData(canvas, imageFieldObject, defaultColor='black') {
	context = canvas.getContext('2d');
	
	// Attempt to get an image child
	var img = imageFieldObject.querySelector('img');
	if(img != null) {
		console.log(img, canvas.width, canvas.height);
		// Draw the image to the canvas and return it
		context.drawImage(img, 0, 0);
		return context.getImageData(0, 0, canvas.width, canvas.height);
		
	} else {
		console.log("Using solid color for", imageFieldObject);
		// Generate an image that's using the defaultColor
		context.fillStyle = defaultColor;
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		return context.getImageData(0, 0, canvas.width, canvas.height);
	}
	
}

function processImages() {
	var canvas = document.getElementById('mappedCanvas');
	var context = canvas.getContext('2d');
	
	var rImg = document.getElementById("imageField1");
	var gImg = document.getElementById("imageField2");
	var bImg = document.getElementById("imageField3");
	var aImg = document.getElementById("imageField4");
	
	// Get the RGBA image data
	var rData = getImageData(canvas, rImg).data;
	var gData = getImageData(canvas, gImg).data;
	var bData = getImageData(canvas, bImg).data;
	var aData = getImageData(canvas, aImg, defaultColor='white').data;
	
	console.log(rData);
	
	// Do the maths
	var resultData = context.createImageData(canvas.width, canvas.height);

	for (var i = 0; i < resultData.data.length; i += 4) {
		resultData.data[i] = rData[i]; // Red
		resultData.data[i + 1] = gData[i]; // Green
		resultData.data[i + 2] = bData[i]; // Blue
		resultData.data[i + 3] = aData[i]; // Alpha
	}

	context.putImageData(resultData, 0, 0);

	var resultImage = new Image();
	resultImage.src = canvas.toDataURL();

	var outputContainer = document.getElementById("imageFieldOutput");
	outputContainer.appendChild(resultImage);

	
}

document.addEventListener('DOMContentLoaded', function () {
    const imageFields = document.querySelectorAll('.image-uploadable');

    imageFields.forEach(function (imageField) {
        imageField.addEventListener('dragenter', handleDragEnter);
        imageField.addEventListener('dragleave', handleDragLeave);

    });

    function handleDragEnter(event) {
		event.preventDefault();
		event.stopPropagation();
		event.target.classList.add('drag-over');
    }

    function handleDragLeave(event) {
		event.preventDefault();
		event.stopPropagation();
		event.target.classList.remove('drag-over');
    }
});

canvasSizeSet = false;