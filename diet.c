#include <stdlib> 
#include <diet.h>
#include <stdio.h>
diet * createTree() {
    diet * tree = (diet*)malloc(sizeof(diet)); 
    diet->root = (tNode*)malloc(sizeof(tNode)); 
    diet->root->start = 8; 
    diet->root->end = 20; //8am 24hr clock
}
int insert(diet * tree, int start, int end) {

}
int remove(diet * tree, tNode * node) {


}
void printRanges(diet * tree) {

}
void searchRange(diet * tree, int start, int end) {

}
//keep in for testing 
int main() {
    

}
