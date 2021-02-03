const modal = document.querySelector('.modal-overlay')

// const button = document.querySelector('.button')
// const close = document.querySelector('.cancel')

// button.addEventListener('click', () => {
//     modal.classList.add('active')

// })

// close.addEventListener('click', () => {
//     modal.classList.remove('active')

// })

let Modal = {
    // open(){
    //     modal.classList.add('active')
    // },
    // close(){
    //         modal.classList.remove('active')
    //     }
        toggle(){
            modal.classList.toggle('active')
        }
}

const Storage = {
    //pegar os dados
    get() {
        //retorna a string em um arry (.parse faz essa conversão)
        return JSON.parse(localStorage.getItem('dev.finances: transactions')) || []
    },
    //setar os lados
    set(transactions){
        //transformar (formatando) um array [transactions] em string
        localStorage.setItem("dev.finances: transactions", JSON.stringify(transactions))
    }
}

const Transaction = {

    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes () {
        // somar as entradas 
        let income = 0
        //pegar todas as transações
        //para cada transação
        Transaction.all.forEach((transaction) => {
            //se for maior que 0
            if (transaction.amount > 0){
                //somar e retornar a variavel
                income += transaction.amount
            }
        })

        return income
    }, 
    expenses () {
        let expense = 0
        //pegar todas as transações
        //para cada transação
        Transaction.all.forEach((transaction) => {
            //se for menor que 0
            if (transaction.amount < 0){
                //somar e retornar a variavel
                expense += transaction.amount
            }
        })
        
        return expense
    },
    total () {
        // entradas - saídas
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction (transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        // console.log(tr.innerHTML)

        DOM.transactionContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {

        // if else ternário
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="remover transação">
            </td>
        `
        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date){
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value) {
        value = Number(value) * 100

        return value
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        //pegando caracteres especias
        value = String(value).replace(/\D/g, "")
        //dividir o valor por 100, pois possuí 2 zeros a mais
        value = Number(value) / 100
        //como quer que faça a formatação - local e moeda brasileira
        value = value.toLocaleString('pt-br', {
            style: "currency",
            currency: "BRL"
        })
        //retorna o sinal (numero) + o valor (string)
        return signal + value
    },
    
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields(){
        const {description, amount, date} = Form.getValues()
        
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "" ){
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatValues(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)
        
        return {
            description, 
            amount,
            date
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            //verificar se todas as informações foram preenchidas
            Form.validateFields()  
            //formatar os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Form.saveTransaction(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            //modal feche
            Modal.toggle()
            //atualizar a aplicação
            // já possui o reload no add(transaction)
        } catch (error) {
            alert(error.message)
        }
       
    }
}


const App = {
    init (){
        Transaction.all.forEach((transaction, index) => {
            // console.log(transaction)
            DOM.addTransaction(transaction, index)
        })
        //chamando a funionalidade update
        DOM.updateBalance()

        Storage.set(Transaction.all)
        
    },
    reload (){
        //limpando e inicianto no reload a aplicação
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

