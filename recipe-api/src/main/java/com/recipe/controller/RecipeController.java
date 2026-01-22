package com.recipe.controller;

import com.recipe.dto.RecipePageResponse;
import com.recipe.model.Recipe;
import com.recipe.repository.RecipeSpecifications;
import com.recipe.service.RecipeService;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService service;

    public RecipeController(RecipeService service) {
        this.service = service;
    }

    @GetMapping
    public RecipePageResponse<Recipe> getAllRecipes(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        Page<Recipe> recipePage = service.getAllRecipes(page - 1, limit);

        return new RecipePageResponse<>(
                page,
                limit,
                recipePage.getTotalElements(),
                recipePage.getContent()
        );
    }

    @GetMapping("/search")
    public RecipePageResponse<Recipe> searchRecipes(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String rating,
            @RequestParam(required = false) String total_time,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        Specification<Recipe> spec = Specification.where(null);

        if (title != null)
            spec = spec.and(RecipeSpecifications.titleContains(title));

        if (cuisine != null)
            spec = spec.and(RecipeSpecifications.cuisineEquals(cuisine));

        if (rating != null) {
            String op = rating.substring(0, 1);
            Float value = Float.parseFloat(rating.substring(1));
            spec = spec.and(RecipeSpecifications.ratingCompare(op, value));
        }

        if (total_time != null) {
            String op = total_time.substring(0, 1);
            Integer value = Integer.parseInt(total_time.substring(1));
            spec = spec.and(RecipeSpecifications.totalTimeCompare(op, value));
        }

        Page<Recipe> result = service.searchRecipes(spec, page - 1, limit);

        return new RecipePageResponse<>(
                page,
                limit,
                result.getTotalElements(),
                result.getContent()
        );
    }
}





