

console.log("CONTENT JS LOADED")

// Função a ser executada quando a div com o ID 'create-issue-dialog' for criada
function onCreateIssueDialogCreated(element) {
  console.log('A div com ID "create-issue-dialog" foi criada:', element);
  setTimeout(() => createListener(), 2000)
  // Coloque aqui o código que você deseja executar quando a div for criada
}

// Seleciona a div com o ID 'page' para monitorar
const targetNode = document.getElementById('jira');

if (targetNode) {
  console.log('A div com o ID "jira" FOI encontrada.');
  // Cria um novo MutationObserver
  const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
              for (const node of mutation.addedNodes) {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                      if (node.id === 'create-issue-dialog') {
                          console.log('### ELEMENTRO CRIADO create-issue-dialog')
                          onCreateIssueDialogCreated(node);
                      }
                  }
              }
          }
      }
  });

  // Configura o observer para monitorar mudanças nos filhos da div com o ID 'page'
  observer.observe(targetNode, {
      childList: true, // Observa a adição e remoção de elementos filhos
      subtree: true,   // Observa toda a subárvore
  });

  // Para parar a observação, você pode chamar observer.disconnect()
  // observer.disconnect();
} else {
  console.error('A div com o ID "body" não foi encontrada.');
}


const fieldsToMonitor = ['description', 'summary', 'P_DURACAO'];

function createListener() {
  console.log("CREATING LISTENERS")
  fieldsToMonitor.forEach(selector => {
    console.log(`Trying to select by id: ${selector}`)
    const field = document.getElementById(selector);
    if (field) {
      field.addEventListener('focusout', (e) => {
        console.log(e);
        provideSuggestions(field);
      });
    } else {
      console.error(`FIELD: ${field} NOT FOUND`)
    }
  });
}

async function provideSuggestions(field) {
  let suggestionsContainer = document.getElementById('suggestions');
  if (!suggestionsContainer) {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions';
    suggestionsContainer.style.position = 'absolute';
    suggestionsContainer.style.backgroundColor = 'white';
    suggestionsContainer.style.border = '1px solid #ccc';
    suggestionsContainer.style.padding = '10px';
    suggestionsContainer.style.maxWidth = '300px';
    suggestionsContainer.style.zIndex = '9999';
    document.body.appendChild(suggestionsContainer);
  }


  const text = field.value;
  await generateSuggestions(text, displaySuggestions, field);

}








async function generateSuggestions(text, func, field) {

  const v_body = { "inputs": { "question": 'qual é o protocolo ?', "context": text } };

  const response = await fetch('https://api-inference.huggingface.co/models/deepset/roberta-base-squad2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    body: JSON.stringify(v_body)
  });

  const data = await response.json();
  console.log(data);
  const suggestions = [data['answer']];

  func(suggestions, field);
}



function displaySuggestions(suggestions, field) {
  const suggestionsContainer = document.getElementById('suggestions');
  suggestionsContainer.innerHTML = '';
  suggestions.forEach(suggestion => {
    const suggestionElement = document.createElement('p');
    suggestionElement.innerText = suggestion;
    suggestionsContainer.appendChild(suggestionElement);
  });

  const fieldRect = field.getBoundingClientRect();
  suggestionsContainer.style.top = `${window.scrollY + fieldRect.bottom}px`;
  suggestionsContainer.style.left = `${window.scrollX + fieldRect.left}px`;
}
