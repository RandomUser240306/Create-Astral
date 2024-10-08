onEvent("recipes", (event) => {
    mixingRecipeGen(event);
    cuttingRecipeGen(event);
})

const FULL_BUCKET_AMOUNT = 81000;
const INGOT_FLUID_AMOUNT = 9000;

function mixingRecipeGen(event) {
    event.forEachRecipe({type:"farmersdelight:cooking"}, recipe => {
        //Gets item name without namespace (e.g. "cooked_rice")
        let outputItem = recipe.getOriginalRecipeResult().getId().split(":")[1]; 
        let inputItems = recipe.getOriginalRecipeIngredients();
        let containers = {
            "minecraft:glass_bottle": [ "hot_cocoa","apple_cider"],
            "minecraft:pumpkin": ["stuffed_pumpkin_block"],
            "#c:dough": ["dumplings"]
        };

        let container = Object.keys(containers).find(key => containers[key].includes(outputItem)) ?? "minecraft:bowl";
        
        //Replaces tomato sauce bowl with fluid in recipes and takes dough out of dumpling recipe
        for (let i = 0; i < inputItems.length; i++) {
            if (inputItems[i].getFirst() == "farmersdelight:tomato_sauce") {
                inputItems.remove(i);
                inputItems.push({fluid:"kubejs:tomato_sauce_fluid", amount: FULL_BUCKET_AMOUNT/4});
                break;
            } else {
                inputItems[i].getFirst().getTags().forEach( tag => {
                    if(tag=="c:dough") inputItems.remove(i);
                });
            }
        }
        //Generates mixing recipe
        event.recipes
            .createMixing({ fluid: "kubejs:" + outputItem + "_fluid", amount: FULL_BUCKET_AMOUNT/4 }, inputItems)
            .heatRequirement("heated")
            .processingTime(100);
        
        //Generates spouting recipe
        event.recipes
            .createFilling(recipe.getOriginalRecipeResult(), [
            container,
            { fluid: "kubejs:" + outputItem + "_fluid", amount: FULL_BUCKET_AMOUNT/4 },
        ]);
        
    });  
    
}

function cuttingRecipeGen(event) {
    event.forEachRecipe({type: 'farmersdelight:cutting'}, recipe => {
        let newList = Utils.newList();
        recipe.json.get('result').forEach(e => newList.push(e));
        newList.reverse(); //prevents conflicts with existing cutting recipes (e.g. log stripping)
        event.custom({
            type: 'create:cutting',
            ingredients: recipe.json.get('ingredients'),
            results: newList,
            processingItem : 50
        });
    });
}
