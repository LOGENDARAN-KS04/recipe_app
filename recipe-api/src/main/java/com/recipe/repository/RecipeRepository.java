package com.recipe.repository;

import com.recipe.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RecipeRepository
        extends JpaRepository<Recipe, Long>,
                JpaSpecificationExecutor<Recipe> {
}

