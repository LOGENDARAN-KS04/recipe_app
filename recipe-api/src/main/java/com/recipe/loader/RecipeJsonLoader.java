package com.recipe.loader;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipe.model.Recipe;
import com.recipe.repository.RecipeRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Iterator;

@Component
public class RecipeJsonLoader {

    @Autowired
    private RecipeRepository recipeRepository;

    @PostConstruct
    public void loadJsonToDatabase() {

        try {
            if (recipeRepository.count() > 0) {
                System.out.println("Recipes already exist. Skipping JSON load.");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            File file = new ClassPathResource("US_recipes_null.json").getFile();

            JsonNode rootNode = mapper.readTree(file);
            Iterator<JsonNode> recipes = rootNode.elements();

            while (recipes.hasNext()) {

                JsonNode node = recipes.next();
                Recipe recipe = new Recipe();

                recipe.setTitle(getText(node, "title"));
                recipe.setCuisine(getText(node, "cuisine"));

                recipe.setRating(parseFloat(node.get("rating")));
                recipe.setPrepTime(parseInt(node.get("prep_time")));
                recipe.setCookTime(parseInt(node.get("cook_time")));
                recipe.setTotalTime(parseInt(node.get("total_time")));

                recipe.setDescription(getText(node, "description"));
                recipe.setServes(getText(node, "serves"));

                recipe.setIngredients(node.get("ingredients").toString());
                recipe.setInstructions(node.get("instructions").toString());
                recipe.setNutrients(node.get("nutrients").toString());

                recipeRepository.save(recipe);
            }

            System.out.println("JSON successfully inserted into database");

        } catch (Exception e) {
            System.out.println("Error loading JSON data");
            e.printStackTrace();
        }
    }

    private Integer parseInt(JsonNode node) {
        if (node == null || node.isNull()
                || node.asText().equalsIgnoreCase("NaN"))
            return null;

        return node.asInt();
    }

    private Float parseFloat(JsonNode node) {
        if (node == null || node.isNull()
                || node.asText().equalsIgnoreCase("NaN"))
            return null;

        return Float.parseFloat(node.asText());
    }

    private String getText(JsonNode node, String field) {
        if (node.get(field) == null || node.get(field).isNull())
            return null;

        return node.get(field).asText();
    }
}
