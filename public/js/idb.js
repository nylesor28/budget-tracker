// create variable to hold db connection
let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('budget_tracker', { autoIncrement: true });
  };

  // upon a successful 
request.onsuccess = function(event) {
    db = event.target.result;
  
    if (navigator.onLine) {
        uploadBudgetTransaction()
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };

  function saveRecord(record) {
    const transaction = db.transaction(['budget_tracker'], 'readwrite');
  
    const budgetObjectStore = transaction.objectStore('budget_tracker');
  
    budgetObjectStore.add(record);
  }


  function uploadBudgetTransaction() {

    const transaction = db.transaction(['budget_tracker'], 'readwrite');
  
    const budgetObjectStore = transaction.objectStore('budget_tracker');
  
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['budget_tracker'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('budget_tracker');
            budgetObjectStore.clear();
            alert('Transaction saved successfully!');
          })
          .catch(err => {
            // set reference to redirect back here
            console.log(err);
          });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener('online', uploadBudgetTransaction);
  