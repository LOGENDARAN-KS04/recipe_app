package com.recipe.service;

import com.recipe.model.Recipe;
import com.recipe.repository.RecipeRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class RecipeService {

    private final RecipeRepository repository;

    public RecipeService(RecipeRepository repository) {
        this.repository = repository;
    }

    // GET ALL RECIPES
    public Page<Recipe> getAllRecipes(int page, int limit) {
        Pageable pageable =
                PageRequest.of(page, limit, Sort.by("rating").descending());

        return repository.findAll(pageable);
    }

    // SEARCH
    public Page<Recipe> searchRecipes(
            Specification<Recipe> spec,
            int page,
            int limit) {

        Pageable pageable = PageRequest.of(page, limit);
        return repository.findAll(spec, pageable);
    }
}
