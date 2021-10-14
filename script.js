const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storege = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    } 

}

const Transaction = {
    all: Storege.get(),
    
    incomes(){
        let income = 0
        Transaction.all.forEach(transaction=>{
            income += transaction.amount > 0 ? transaction.amount : 0
        })
        return income
    }, 
    expenses(){
        let expense = 0
        Transaction.all.forEach(transaction=>{
            expense += transaction.amount < 0 ? transaction.amount : 0
        })
        return expense
    }, 
    total(){
        return Transaction.incomes() + Transaction.expenses()
    },
    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index){
        Transaction.all.splice(index,1)
        App.reload()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    
    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)  
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td class="date"><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>`
        
        return html
    },
    updateBalance(){
        document.getElementById('incomeDisplay').innerHTML =  Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) >= 0 ? '' : '- '
        value = String(value).replace(/\D/g,"")
        value = Number(value) / 100
        value = value.toLocaleString('pt-Br', {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    },
    formatAmount(value){
        value *= 100
        return Math.round(value)
    },
    formatDate(date){
        const splittedDate = date.split('-')
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),


    getValue(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateFields(){
        const {description, amount, date} = Form.getValue()

        if(description.trim()==="" || amount.trim()==="" || date.trim()===""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getValue()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearFields(){
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },
    submit(event){
        event.preventDefault()

        try{
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)            
            Form.clearFields()
            Modal.close()

        } catch (error){
            alert(error.message)
        }        
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)        
        DOM.updateBalance()
        Storege.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

