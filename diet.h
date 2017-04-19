
typedef struct tNode {
    int start; 
    int end; 
    struct tNode * parent;
    struct tNode * left;
    struct tNode * right;
    //maybe
    struct tNode * root; 
} tNode;

typedef struct diet {
    int size; 
    struct tNode * root; 
} diet; 

diet * createTree();
int insert(tNode * node); 
int remove(tNode * node); 
void printRanges(diet * tree); 
void searchRange(diet * tree, int start, int end); 
