// Idk some code I copied that compares 2 arrays

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // if the argument is the same array, we can be sure the contents are same as well
    if(array === this)
        return true;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

let card_quantity = []
let old_card_quantity = []
let card_quantity_to_add = []

async function display_cards() {
    let card_layout = document.getElementById("add_card_layout");
    Array.from(card_layout.children).forEach(child => {
        card_layout.removeChild(child);
    });
    document.getElementById("save_button").disabled = true;
    card_quantity = []
    old_card_quantity = [];
    card_quantity_to_add = [];
    for (let i = 0; i < card_data.length; i++) {
        card = JSON.parse(card_data[i][3]);
        let new_card_block = document.createElement("div");
        new_card_block.className = "card_block";
        new_card_block.id = `card_block${card_data[i][0]}`

        let new_card_quantity_box = document.createElement("div");
        new_card_quantity_box.className = "card_quantity";
        let new_card_quantity_add = document.createElement("button");
        let new_card_quantity = document.createElement("p");
        let new_card_quantity_min = document.createElement("button");
        new_card_quantity_add.className = "add_button";
        new_card_quantity.className = "quantity";
        new_card_quantity_min.className = "min_button";
        new_card_quantity_add.textContent = "+";
        card_quantity.push(card_data[i][4]);
        old_card_quantity.push(card_data[i][4]);
        card_quantity_to_add.push(0);
        new_card_quantity.textContent = card_data[i][4];
        new_card_quantity_min.textContent = "-";
        new_card_quantity_add.addEventListener("click", function(){change_quantity(i, 1, new_card_quantity)});
        new_card_quantity_min.addEventListener("click", function(){change_quantity(i, -1, new_card_quantity)});
        new_card_quantity_box.appendChild(new_card_quantity_add);
        new_card_quantity_box.appendChild(new_card_quantity);
        new_card_quantity_box.appendChild(new_card_quantity_min);
        new_card_block.appendChild(new_card_quantity_box);
    
        // Card Image
        let new_card_image = document.createElement("img");
        new_card_image.className = "card_image";
        new_card_image.src = card.images.small;
        new_card_block.appendChild(new_card_image);
    
        // Card Name and Collection Info
        let new_card_collection_box = document.createElement("div");
        new_card_collection_box.className = "collection_box";
        let new_card_title = document.createElement("p");
        new_card_title.className = "card_title";
        new_card_title.textContent = card.name;
        let new_card_set = document.createElement("p");
        new_card_set.className = "card_set";
        if (card.rarity != "Promo") {
            new_card_set.textContent = `${card.number}/${card.outOf} (${card.id})`;
        } else {
            new_card_set.textContent = `${card.number} (${card.id})`;
        }
        new_card_collection_box.appendChild(new_card_title);
        new_card_collection_box.appendChild(new_card_set);
        new_card_block.appendChild(new_card_collection_box);
    
        card_layout.appendChild(new_card_block);
    }

    // if (cards_to_add.length > 0) {
    //     document.getElementById("submit_button").disabled = false;
    // } else {
    //     document.getElementById("submit_button").disabled = true;
    // }
}

function change_quantity(id, value, element) {
    if (card_quantity[id] + value >= 0) {
        card_quantity[id] += value;
        card_quantity_to_add[id] += value;
        element.textContent = card_quantity[id];
    }
    document.getElementById("save_button").disabled = card_quantity.equals(old_card_quantity);
}

function open_sort_menu() {
    document.getElementById("sort_by_dropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.sort_by')) {
    var dropdowns = document.getElementsByClassName("dropdown_content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
} 

async function save() {
    document.getElementById("save_button").disabled = true;
    let json_data = JSON.stringify({"card_data": card_data.map(i => JSON.parse(i[3])), "card_quantity": card_quantity_to_add.map(i => parseInt(i))});
    await fetch('/collection', {
        method: "POST",
        headers: {
                'Content-Type': 'application/json' // Indicate JSON data
        },
        body: json_data
    })
    .then(response => {return response.json()})
    .then(data => {
        console.log(data);
        card_data = data;
        alert("Saved!");
        display_cards();
        // Handle successful response, e.g., update UI
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., display an error message
    });
}

display_cards();