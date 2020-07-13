import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {clearLoader, elements, renderLoader} from './views/base';
import {clearResults} from "./views/searchView";

const state={};


// Search controller

const controlsearch = async ()=>{

    //1. get query from view
    const query =searchView.getInput();


    if(query){
        //2. New search object and add to state
        state.search=new Search(query);

        //3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);


        try {
            //4. Search for results
            await state.search.getResults();//await because getresults is an async func and it returns a promise


            //5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        }
        catch(error){
            alert('Something wrong with the search!');
            console.log(error);
            clearLoader();
        }
    }


};



elements.searchForm.addEventListener('submit',e =>{
    e.preventDefault();
    controlsearch();
} );





elements.searchResPages.addEventListener('click',e=>{
    const btn=e.target.closest('.btn-inline');
    if (btn){
        const goToPage =parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }
})


// RECIPE CONTROLLER
const controlRecipe =async () =>{
    // Get id from url
  const id=window.location.hash.replace('#','');


  if(id){
      //prepare ui for changes
      recipeView.clearRecipe();
      renderLoader(elements.recipe);

      //highlight selected search item
      if(state.search) {
          searchView.highlightSelected(id);
      }

      //create new recipe object
      state.recipe=new Recipe(id);


      try {
          //get recipe data
          await state.recipe.getRecipe();
          console.log(state.recipe);
          state.recipe.parseIngredients();

          //calculate serving and time
          state.recipe.calcServings();
          state.recipe.calcTime();

          // render recipe
          clearLoader();
          recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
      }
      catch(error){
          console.log(error);
          alert('Something went wrong while processing the recipe !');
      }
  }
};



//window.addEventListener('hashchange',controlRecipe);
//window.addEventListener('load',controlRecipe);


['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));


// LIST CONTROLLER

const controlList= () =>{
  //create new list if we have none yet
  if(!state.list) state.list=new List();

  //add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el=>{
        const item=state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    })

};

//handle delete and update list items
elements.shopping.addEventListener('click',e =>{
    const id=e.target.closest('.shopping__item').dataset.itemid;

    //handle the delete
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    }//handle the count update
    else if (e.target.matches('.shopping__count-value')){
        const val=parseFloat(e.target.value,10);
        state.list.updateCount(id,val);
    }

});

// LIKE CONTROLLER
const controlLike =() =>{
    if(!state.likes) state.likes = new Likes();
    const currentID=state.recipe.id;
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to the  ui list
        likesView.renderLike(newLike);

    }//user has liked current recipe
    else{
        //remove like from the state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);
        //remove like from the ui list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

//restore liked recipes on page load
window.addEventListener('load',() =>{
   state.likes=new Likes();

   //restore likes
    state.likes.readStorage();

    // toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));

});


//handling recipe button clicks
elements.recipe.addEventListener('click',e =>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings>1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if(e.target.matches('.btn-increase, .btn-increase *')){
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    }
    else if (e.target.matches('.recipe-btn--add, .recipe-btn--add *')){
        //add ingredients to shopping list
        controlList();
    }
    else if (e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();

    }

});

