let cards_to_add = [];
let cards_quantity_to_add = [];

document.getElementById("card_input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        add_card();
    }
});

async function fetch_card(card_id) {
    try {
        // Fetch the set
        const set_json = await fetch(`/static/data/cards/en/${String(card_id).split('-')[0]}.json`);
        if (!set_json.ok) { throw new Error(`Response status: ${set_json.status}`); }
        const card_result = await set_json.json();
        let card_data = card_result.find(x => x.id == card_id); // Filter the specific card
        // Fetch all sets and find the current set data 
        const sets = await fetch('/static/data/sets/en.json');
        if (!sets.ok) { throw new Error(`Response status: ${set_json.status}`); }
        const set_result = await sets.json();
        let set_data = set_result.find(x => x.id == String(card_id).split('-')[0]);
        card_data.setName = set_data.name;
        card_data.outOf = String(set_data.printedTotal);
        console.log(card_data);
        cards_to_add.push(card_data);
        cards_quantity_to_add.push(1);
        return card_data;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

async function add_card() {
    let input = document.getElementById("card_input");
    let card;
    console.log("hi")
    if (card = await fetch_card(input.value)) {
        input.value = "";
    } else {
        alert("Error fetching card");
        input.value = "";
        return false;
    }
    let card_layout = document.getElementById("add_card_layout");

    let new_card_block = document.createElement("div");
    new_card_block.className = "card_block";

    let new_card_quantity_box = document.createElement("div");
    new_card_quantity_box.className = "card_quantity";
    let new_card_quantity_add = document.createElement("button");
    let new_card_quantity = document.createElement("p");
    let new_card_quantity_min = document.createElement("button");
    new_card_quantity_add.className = "add_button";
    new_card_quantity.className = "quantity";
    new_card_quantity_min.className = "min_button";
    new_card_quantity_add.textContent = "+";
    new_card_quantity.textContent = "1";
    new_card_quantity_min.textContent = "-";
    let n = cards_to_add.length;
    new_card_quantity_add.addEventListener("click", function(){change_quantity(n - 1, 1, new_card_quantity)});
    new_card_quantity_min.addEventListener("click", function(){change_quantity(n - 1, -1, new_card_quantity)});
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

    if (cards_to_add.length > 0) {
        document.getElementById("submit_button").disabled = false;
    } else {
        document.getElementById("submit_button").disabled = true;
    }
}

function change_quantity(id, value, element) {
    console.log(id);
    if (cards_quantity_to_add[id] + value >= 0) {
        cards_quantity_to_add[id] += value;
        element.textContent = cards_quantity_to_add[id];
    }
}

async function submit() {
    document.getElementById("submit_button").disabled = true;
    let json_data = JSON.stringify({"card_data": cards_to_add, "card_quantity": cards_quantity_to_add});
    await fetch('/add_cards', {
        method: "POST",
        headers: {
                'Content-Type': 'application/json' // Indicate JSON data
        },
        body: json_data
    })
    .then(response => response)
    .then(data => {
        console.log('Success:', data);
        // Handle successful response, e.g., update UI
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., display an error message
    });
}