const Modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    }, // abrir modal: adicionar class active ao modal
    close() {

        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    } //fechar modal: remover a class active do modal
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] //parse vai transformar de string para array, se não tiver a chave vai retornar um array vazio
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //stringify ta transformando o array em string. o dev.finances é um nome qualquer
    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    incomes() {
        let income = 0;
        //pegar todas as transações
        //para cada transação
        Transaction.all.forEach(transaction => { //a => é pra não precisar usar function(transaction)
            //se ela for maior que zero
            if (transaction.amount > 0) {
                //somar a uma variavel e retornar a variavel
                income += transaction.amount; // o += é como se fosse income + transaction.amount
            }
        })
        return income;

    },
    expenses() {
        let expense = 0;

        Transaction.all.forEach(transaction => {

            if (transaction.amount < 0) {

                expense += transaction.amount;
            }
        })
        return expense;

    },
    total() {

        return Transaction.incomes() + Transaction.expenses();

    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    }, //ta pegando o que ta na const html e jogando pro tr (antes o tr tava envolvendo esse conteudo)

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense" //se amount for maior que zero a class é income, se não é expense, ai grava o resultado na variavel CSSclass

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
} //ta pegando o valor de income, expense e total e formatando

const Utils = {
    formatAmount(value) {
        

        value = Number(value) * 100 //pra tirar a virgula e ponto do valor caso a pessoa coloque
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-") //vai separar a data pelos traços e cada um vai virar um array
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}` //ta reorganizando a data pela posição do array, pois esta no padrão USA
    },


    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }

} //const signal: se o valor de entrada for negativo, vai acrescentar o -, se não, não coloca nada
// replace, ta procurando tudo que é string e trocando por nada
//ta transformando em numero e dividindo por 100
//ta formatando a moeda
//return ta adicionando o simbolo de - de novo, na moeda já formatada

const Form = {
    description: document.querySelector('input#description'), //ta pegando os input descrição, valor e data do formulário e gravando aqui, ta só acessando
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() { //agora pra acessar somente os valores dos inputs acima
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    }, //quando chamar esse getValues vai retornar um objeto com os valores dos inputs

    validateFields() {
        const { description, amount, date } = Form.getValues() //salvando os valores dos inputs em uma variável

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") //ta verificando se algum campo não ta preenchido, se não tiver vai dar um erro
        {

           throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() { //quando clicar em submit vai chamar essa função, que vai formatar os valores e as datas
        let { description, amount, date } = Form.getValues()
      

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
        
       return {
        description, //é o mesmo que description: description,
        amount,
        date
       } //ta retornando os valores formatados 
        
    },

    clearFields() { //limpando o formulário
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) { //quando clicar em submit vai realizar tudo que ta aqui dentro
        event.preventDefault() //pra não rodar a ação padrão do evento e podemros colocar a nossa
        
        try {
            //verificar se todas as informações foram preenchidas
            Form.validateFields()
            //formatar os dados para salvar
            const transaction = Form.formatValues() //pra salvar os dados formatados em uma const
    
            //salvar
            Transaction.add(transaction)
            //apagar os dados do formulário
            Form.clearFields()
            //modal feche
            Modal.close()
        } catch (error) {
            console.error({error})
            alert(error.message)
        } //ta capturando o erro e enviando a mensagem do erro

    }
} //quando clicar no botão salvar vai ativar la no html o submit, e


const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction) //adicionando na DOM

        DOM.updateBalance() //atualizando os cartões

        Storage.set(Transaction.all)

    },

        

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()




