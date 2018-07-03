// Data encapsulation allows us to hide implementation details of a specific module from
// the outside scope. So we only expose public interface. = which is sometimes called API.
// Module pattern
// IIFE unnamed function wrapped inside paranthesis. -> Data privacy, because IIFE creates new scope.
// That scope is not visible from the outside scope.

// First module / BUDGET CONTROLLER
var budgetController = (function () {

    //function construcot ( so we can create multiple expenses )
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    //This returns the percentage, above method calculates it. (Could be in same method, but we want
    // that each method has just one task.)
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    //function constructor ( jotta voidaan käyttää uudestaan ja uudestaan )
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;

    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1      // -1 "-1 viittaa, ettei järkevää arvoa ole näytettävissä, it doesen't exist yet"
    };

    //puclic method
    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push item into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                // splice method, splice("the index of item we want to start deleting", "How many elements we wasnt to delete from that index")
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            //                  this function (inside forEach) is callback function
            //                  which have access to current variable
            // forEach does not return something and does not store the value in some variable
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            // Here we use map, because map returns something and stores it in variable, while forEach does not.
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            }); 
            return allPerc;
        },

        getBudget: function () {
            return {
                budget : data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();


//second module / UI CONTROLLER
var UIController = (function () {

    // . stringin edessä on class selector, eli html filessä ne on class= jotain
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    // these are private methods
    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        // + or - before number
        //exactly 2 decimal points
        // comma separating the thousands
        // abs = absolute = removes the sign of the number
        num = Math.abs(num);
        // toFixed puts always two decimals
        num = num.toFixed(2);

        numSplit = num.split('.');

        // this is still a string, so we can use .length
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        //these are public methods
        addListiItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            // parentNode , siirrytään DOM rakenteessa yksi ylöspäin ( koska vain child voidaan poistaa)
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // Array is function constructor for all arrays. Here we trick slice method to think it gets array (querySelector returns list)
            //so we can return array, and get all the cool methods for it. (e.g slice)
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.budgetLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent = '---';
            }
        },

        //these are public methods
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, month, moths, year;
            // stores the date of today, when we dont pass anything ( new keyword when object constructor)
            now = new Date();  
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();   // now object inherits bunch of methods from Date prototype
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            // this return nodeList, so in order to loop over this, we cant use forEach method
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);

                nodeListForEach(fields, function(cur) {
                    // toggle adds the red focus when its not there, and when it is, it removes it?
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        // we expose DOMstring to public, so we can use them in controller too
        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


//third module / GLOBAL APP CONTROLLER.  Controller is the place, where we tell other modules what to do
var controller = (function (budgetCtrl, UICtrl) {

    // all our eventListeners are setup in this function
    var setupEventListeners = function () {
        //get exposed DOMstrings from UIController (this DOM here cos we need it only for eventListeners
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        // All of our strings are stored in DOM.            cnrlDeleteItem callback function ( no ();)
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        // Here we have callback function changedType which is located in UIController, because it has something to do with UI
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    //event delegation. Setting up the event on parent element of the elements we are actually interested in

    var updateBudget = function () {

        //       1. Calculate the budget
        budgetCtrl.calculateBudget();

        //       2. Return the budget , this time we return something, so we have tstore it in variable!
        var budget = budgetCtrl.getBudget();

        //       3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function () {
        var input, newItem;

        //       1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //       2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            //       3. Add the item to the UI
            UICtrl.addListiItem(newItem, input.type);

            //       4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    //public initialization method init ( This init method happens right when we start our app)
    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

//start
controller.init();
