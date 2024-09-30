var vector = new Two.Vector();
var entities = [];
var mouse;
var copy = [
    "Array",
    "LinkedList",
    "Stack",
    "Queue",
    "Tree",
    "Graph",
    "HashMap",
    "Heap"
];

var container = document.querySelector('.matterJs');
var two = new Two({
    type: Two.Types.canvas,
    width: container.clientWidth,
    height: container.clientHeight,
    autostart: true
}).appendTo(container);

var solver = Matter.Engine.create();
solver.world.gravity.y = 1;

var bounds = {
    length: 5000,
    thickness: 50,
    properties: {
        isStatic: true
    }
};

bounds.left = createBoundary(bounds.thickness, bounds.length);
bounds.right = createBoundary(bounds.thickness, bounds.length);
bounds.bottom = createBoundary(bounds.length, bounds.thickness);

Matter.World.add(solver.world, [
    bounds.left.entity,
    bounds.right.entity,
    bounds.bottom.entity
]);

var defaultStyles = {
    size: two.width * 0.08,
    weight: 400,
    fill: "white",
    leading: two.width * 0.08 * 0.8,
    family: "Angus, Arial, sans-serif",
    alignment: "center",
    baseline: "baseline",
    margin: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
};

addSlogan();
resize();
mouse = addMouseInteraction();
two.bind("resize", resize).bind("update", update);

function addMouseInteraction() {
    var mouse = Matter.Mouse.create(container);
    var mouseConstraint = Matter.MouseConstraint.create(solver, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2
        }
    });

    Matter.World.add(solver.world, mouseConstraint);

    return mouseConstraint;
}

function resize() {
    var length = bounds.length;
    var thickness = bounds.thickness;

    vector.x = -thickness / 2;
    vector.y = two.height / 2;
    Matter.Body.setPosition(bounds.left.entity, vector);

    vector.x = two.width + thickness / 2;
    vector.y = two.height / 2;
    Matter.Body.setPosition(bounds.right.entity, vector);

    vector.x = two.width / 2;
    vector.y = two.height + thickness / 2;
    Matter.Body.setPosition(bounds.bottom.entity, vector);

    var size = calculateSize(two.width);
    var leading = size * 0.8;

    for (var i = 0; i < two.scene.children.length; i++) {
        var child = two.scene.children[i];

        if (!child.isWord) {
            continue;
        }

        updateWordSize(child, size, leading);
    }
}

function calculateSize(width) {
    if (width < 480) {
        return width * 0.12;
    } else if (width > 1080 && width < 1600) {
        return width * 0.07;
    } else if (width > 1600) {
        return width * 0.06;
    } else {
        return width * 0.08;
    }
}

function updateWordSize(child, size, leading) {
    var text = child.text;
    var rectangle = child.rectangle;
    var entity = child.entity;

    text.size = size;
    text.leading = leading;

    var rect = text.getBoundingClientRect(true);
    rectangle.width = rect.width;
    rectangle.height = rect.height;

    Matter.Body.scale(entity, 1 / entity.scale.x, 1 / entity.scale.y);
    Matter.Body.scale(entity, rect.width, rect.height);
    entity.scale.set(rect.width, rect.height);

    text.size = size / 3;
}

function addSlogan() {
    var x = defaultStyles.margin.left;
    var y = -two.height;
    var shapes = ["circle", "ellipse", "triangle", "pentagon"];

    for (var i = 0; i < copy.length; i++) {
        var word = copy[i];
        var group = new Two.Group();
        var text = new Two.Text("", 0, 0, defaultStyles);

        group.isWord = true;
        text.value = word;

        var rect = text.getBoundingClientRect();
        var ox = x + rect.width / 2;
        var oy = y + rect.height / 2;

        if (x + rect.width >= two.width) {
            x = defaultStyles.margin.left;
            y += defaultStyles.leading + defaultStyles.margin.top + defaultStyles.margin.bottom;
            ox = x + rect.width / 2;
            oy = y + rect.height / 2;
        }

        group.translation.x = ox;
        group.translation.y = oy;
        text.translation.y = 14;

        var randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        var shape = createShape(rect.width, rect.height, randomShape);  // Create random shape
        setColors(text, shape, word);

        var entity = Matter.Bodies.rectangle(ox, oy, rect.width * 1.5, rect.height * 1.5);
        entity.scale = new Two.Vector(rect.width * 1.5, rect.height * 1.5);
        entity.object = group;
        entities.push(entity);

        x += rect.width * 1.5 + defaultStyles.margin.left + defaultStyles.margin.right;

        group.text = text;
        group.rectangle = shape;
        group.entity = entity;

        group.add(shape, text);
        two.add(group);
    }

    Matter.World.add(solver.world, entities);
}

function createShape(width, height, shapeType) {
    let shape;
    switch (shapeType) {
        case "circle":
            shape = new Two.Circle(0, 0, Math.min(width, height) / 2);  // Creates a circle
            break;
        case "ellipse":
            shape = new Two.Ellipse(0, 0, width / 2, height / 2);  // Creates an ellipse
            break;
        case "triangle":
            shape = new Two.Polygon(0, 0, Math.min(width, height) / 2, 3);  // Creates a triangle
            break;
        case "pentagon":
            shape = new Two.Polygon(0, 0, Math.min(width, height) / 2, 5);  // Creates a pentagon
            break;
        default:
            shape = new Two.RoundedRectangle(0, 0, width, height, 20);  // Default rectangle
            break;
    }
    return shape;
}

function setColors(text, rectangle, word) {
    switch (word.toLowerCase()) {
        case "array":
            text.fill = "#FFFFFF";
            rectangle.fill = "#FF3EA5";
            break;
        case "linkedlist":
            text.fill = "#000000";
            rectangle.fill = "#B0BAC5";
            break;
        case "stack":
            text.fill = "#000000";
            rectangle.fill = "#FFFFFF";
            break;
        case "queue":
            text.fill = "#000000";
            rectangle.fill = "#9071FB";
            break;
        case "tree":
            text.fill = "#000000";
            rectangle.fill = "#F6FA5E";
            break;
        case "graph":
            text.fill = "#FFFFFF";
            rectangle.fill = "#FF5733";
            break;
        case "hashmap":
            text.fill = "#FFFFFF";
            rectangle.fill = "#AF47D2";
            break;
        case "heap":
            text.fill = "#000000";
            rectangle.fill = "#FFC300";
            break;
        default:
            text.fill = "white";
            rectangle.fill = "rgba(255, 255, 255, 0.85)";
            break;
    }
    rectangle.noStroke();
    rectangle.stroke = '#000000';
    rectangle.linewidth = 3;
    rectangle.visible = true;
}

function update(frameCount, timeDelta) {
    var allBodies = Matter.Composite.allBodies(solver.world);
    Matter.MouseConstraint.update(mouse, allBodies);
    Matter.MouseConstraint._triggerEvents(mouse);

    Matter.Engine.update(solver);

    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        entity.object.position.copy(entity.position);
        entity.object.rotation = entity.angle;
    }
}

function createBoundary(width, height) {
    var rectangle = two.makeRectangle(0, 0, width, height);
    rectangle.visible = false;

    rectangle.entity = Matter.Bodies.rectangle(0, 0, width, height, bounds.properties);
    rectangle.entity.position = rectangle.position;

    return rectangle;
}

// Animation starts immediately
two.play();
