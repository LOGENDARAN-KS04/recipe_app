package com.recipe.dto;

import java.util.List;

public class RecipePageResponse<T> {

    private int page;
    private int limit;
    private long total;
    private List<T> data;

    public RecipePageResponse(int page, int limit, long total, List<T> data) {
        this.page = page;
        this.limit = limit;
        this.total = total;
        this.data = data;
    }

    public int getPage() {
        return page;
    }

    public int getLimit() {
        return limit;
    }

    public long getTotal() {
        return total;
    }

    public List<T> getData() {
        return data;
    }
}

