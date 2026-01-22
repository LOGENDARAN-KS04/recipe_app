package com.recipe.repository;

import com.recipe.model.Recipe;
import org.springframework.data.jpa.domain.Specification;

public class RecipeSpecifications {

    public static Specification<Recipe> titleContains(String title) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("title")),
                        "%" + title.toLowerCase() + "%");
    }

    public static Specification<Recipe> cuisineEquals(String cuisine) {
        return (root, query, cb) ->
                cb.equal(cb.lower(root.get("cuisine")),
                        cuisine.toLowerCase());
    }

    public static Specification<Recipe> ratingCompare(String op, Float value) {
        return (root, query, cb) -> {
            return switch (op) {
                case ">" -> cb.greaterThan(root.get("rating"), value);
                case "<" -> cb.lessThan(root.get("rating"), value);
                case "=" -> cb.equal(root.get("rating"), value);
                default -> null;
            };
        };
    }

    public static Specification<Recipe> totalTimeCompare(String op, Integer value) {
        return (root, query, cb) -> {
            return switch (op) {
                case ">" -> cb.greaterThan(root.get("totalTime"), value);
                case "<" -> cb.lessThan(root.get("totalTime"), value);
                case "=" -> cb.equal(root.get("totalTime"), value);
                default -> null;
            };
        };
    }
}

