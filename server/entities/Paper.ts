import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

interface MarkingItem {
  typeId: string;
  typeName: string;
  positive: number;
  negative: number;
}

interface Question {
  id: number;
  question: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_e?: string;
  answer: string;
  marks: string;
  mode: string;
}

@Entity()
export class Paper {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  gradeId!: number;

  @Column()
  sectionId!: number;

  @Column('simple-array')
  subjectIds!: string[];

  @Column('simple-array', { nullable: true })
  topicIds!: string[];

  @Column('simple-array', { nullable: true })
  skills!: string[];

  @Column('simple-array', { nullable: true })
  types!: string[];

  @Column('json')
  marking!: MarkingItem[];

  @Column('json')
  selectedQuestions!: Record<string, Question[]>;

  @Column('json')
  selectedAnswers!: Record<string, Question[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
