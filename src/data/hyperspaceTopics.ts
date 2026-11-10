import type { TopicNode } from '../lib/hyperbolic'

/**
 * A small slice of the kind of tree HyperSpace maps: Wikipedia's category graph
 * under Artificial intelligence. The real app holds 5,635 topics; this preview
 * keeps 53 so it stays light.
 */
export const aiTopics: TopicNode = {
  label: 'Artificial intelligence',
  children: [
    {
      label: 'Machine learning',
      children: [
        {
          label: 'Deep learning',
          children: [
            { label: 'Transformers' },
            { label: 'Convolutional networks' },
            { label: 'Recurrent networks' },
            { label: 'Diffusion models' },
          ],
        },
        {
          label: 'Reinforcement learning',
          children: [{ label: 'Q-learning' }, { label: 'Policy gradients' }, { label: 'Multi-armed bandits' }],
        },
        {
          label: 'Supervised learning',
          children: [{ label: 'Decision trees' }, { label: 'Support vector machines' }, { label: 'Linear regression' }],
        },
        {
          label: 'Unsupervised learning',
          children: [{ label: 'Clustering' }, { label: 'Dimensionality reduction' }, { label: 'Autoencoders' }],
        },
      ],
    },
    {
      label: 'Natural language processing',
      children: [
        {
          label: 'Large language models',
          children: [{ label: 'Retrieval-augmented generation' }, { label: 'Fine-tuning' }, { label: 'Prompt engineering' }],
        },
        { label: 'Machine translation' },
        { label: 'Speech recognition' },
        { label: 'Word embeddings' },
        { label: 'Sentiment analysis' },
      ],
    },
    {
      label: 'Computer vision',
      children: [
        { label: 'Object detection' },
        { label: 'Image segmentation' },
        { label: 'Facial recognition' },
        { label: 'Optical character recognition' },
      ],
    },
    {
      label: 'Robotics',
      children: [{ label: 'Motion planning' }, { label: 'SLAM' }, { label: 'Humanoid robots' }, { label: 'Swarm robotics' }],
    },
    {
      label: 'Knowledge representation',
      children: [{ label: 'Knowledge graphs' }, { label: 'Ontologies' }, { label: 'Semantic web' }, { label: 'Expert systems' }],
    },
    {
      label: 'Search and planning',
      children: [
        { label: 'A* search' },
        { label: 'Minimax' },
        { label: 'Constraint satisfaction' },
        { label: 'Monte Carlo tree search' },
      ],
    },
    {
      label: 'AI safety',
      children: [{ label: 'Alignment' }, { label: 'Explainable AI' }, { label: 'Algorithmic bias' }, { label: 'AI governance' }],
    },
  ],
}
