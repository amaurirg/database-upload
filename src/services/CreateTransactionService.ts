// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';



interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({ title, type, value, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionsRepository.getBalance();
    if(type === 'outcome' && value > total) {
      throw new AppError("You do not have enough balance");
    }
    const categoriesRepository = getRepository(Category);
    let categoryFind = await categoriesRepository.findOne({ where: { title: category } });
    if (!categoryFind) {
      const newCategory = {
        title: category,
      }
      categoryFind = await categoriesRepository.save(newCategory);
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: categoryFind.id,
    }
    );
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
